# Snapshot/Template System Security Audit

**Date**: October 26, 2025  
**Auditor**: AI Assistant  
**Scope**: Recently implemented snapshot and public template system

## Executive Summary

The snapshot system has been implemented with **good security fundamentals** but has **several critical vulnerabilities** that need immediate attention. The system properly implements authentication and authorization in most areas, but there are significant issues with:

1. **Missing authorization checks in snapshot deletion**
2. **Clone API using outdated project structure**
3. **Potential for unauthorized snapshot access**
4. **Missing rate limiting on expensive operations**
5. **Information disclosure in error messages**

---

## 🔴 CRITICAL VULNERABILITIES

### 1. **Missing Authorization in Snapshot Deletion**
**Severity**: CRITICAL  
**Location**: `app/lib/.server/snapshots/snapshot-service.ts:265-285`

```typescript
export async function deleteSnapshot(
  db: Database,
  snapshotId: string,
  r2Bucket: R2Bucket
): Promise<void> {
  // ❌ NO AUTHORIZATION CHECK
  // Anyone who can call this function can delete any snapshot
  const files = await getSnapshotFiles(db, snapshotId);
  // ...
}
```

**Impact**: If this function is exposed through an API endpoint, any authenticated user could delete any snapshot.

**Recommendation**:
```typescript
export async function deleteSnapshot(
  db: Database,
  snapshotId: string,
  userId: string, // Add userId parameter
  r2Bucket: R2Bucket
): Promise<void> {
  // Verify ownership
  const snapshot = await queryFirst(
    db,
    `SELECT ps.*, p.user_id 
     FROM project_snapshots ps
     JOIN projects p ON ps.project_id = p.id
     WHERE ps.id = ?`,
    snapshotId
  );
  
  if (!snapshot || snapshot.user_id !== userId) {
    throw new Error('Unauthorized: Cannot delete snapshot');
  }
  
  // ... rest of deletion logic
}
```

---

### 2. **Clone API Using Outdated Structure**
**Severity**: HIGH  
**Location**: `app/routes/api.projects.clone.ts:26-36`

```typescript
// ❌ This queries projects.files which doesn't exist in new schema
const sourceProject = await queryFirst(
  db,
  'SELECT id, name, description, visibility, files FROM projects WHERE id = ? AND visibility = ?',
  sourceProjectId,
  'public'
);
```

**Impact**: 
- Clone functionality is broken
- Should be cloning from snapshots, not live projects
- Defeats the purpose of the snapshot system

**Recommendation**: Update clone API to use snapshots:
```typescript
// Get the latest snapshot for the public project
const snapshot = await queryFirst(
  db,
  `SELECT ps.* 
   FROM project_snapshots ps
   JOIN projects p ON ps.project_id = p.id
   WHERE p.id = ? AND p.visibility = 'public'
   ORDER BY ps.version DESC
   LIMIT 1`,
  sourceProjectId
);

if (!snapshot) {
  throw new Response('Template not found', { status: 404 });
}

// Get snapshot files from R2
const files = await getSnapshotFiles(db, snapshot.id);
// Copy files to new project...
```

---

### 3. **Potential Unauthorized Snapshot Access**
**Severity**: MEDIUM  
**Location**: `app/lib/.server/snapshots/snapshot-service.ts:181-200`

```typescript
export async function getSnapshotFiles(
  db: Database,
  snapshotId: string
): Promise<SnapshotFile[]> {
  // ❌ NO CHECK if snapshot belongs to public project
  const rows = await queryAll<any>(
    db,
    `SELECT * FROM snapshot_files WHERE snapshot_id = ? ORDER BY file_path`,
    snapshotId
  );
  // ...
}
```

**Impact**: If called directly, could expose private project snapshots.

**Recommendation**: Add visibility check or make this a private function only called after authorization.

---

### 4. **Missing Rate Limiting on Expensive Operations**
**Severity**: MEDIUM  
**Location**: Multiple endpoints

**Affected Endpoints**:
- `POST /api/projects/{id}/republish` - Creates snapshots (R2 copies)
- `GET /api/snapshots/{id}/files` - Reads all files from R2
- `POST /api/projects/clone` - Creates new projects

**Impact**: 
- Resource exhaustion attacks
- High R2 costs from abuse
- Database overload

**Recommendation**: Implement rate limiting:
```typescript
// Example for republish endpoint
const REPUBLISH_RATE_LIMIT = 5; // per hour
const lastRepublish = await queryFirst(
  db,
  `SELECT snapshot_created_at FROM projects 
   WHERE id = ? AND snapshot_created_at > datetime('now', '-1 hour')`,
  projectId
);

if (lastRepublish) {
  throw new Response('Rate limit exceeded. Please wait before republishing.', { 
    status: 429 
  });
}
```

---

### 5. **Information Disclosure in Error Messages**
**Severity**: LOW  
**Location**: Multiple files

**Examples**:
```typescript
// ❌ Reveals internal structure
console.error(`Failed to copy file ${file.file_path} to snapshot:`, error);
console.error('Error fetching snapshot files:', error);
```

**Recommendation**: 
- Log detailed errors server-side only
- Return generic error messages to clients
- Don't expose file paths, database structure, or internal errors

---

## ✅ SECURITY STRENGTHS

### 1. **Proper Authentication Checks**
All mutation endpoints properly check authentication:
```typescript
const userId = await getOptionalUserId(args);
if (!userId) {
  throw new Response('Unauthorized', { status: 401 });
}
```

### 2. **Ownership Verification**
Snapshot creation verifies project ownership:
```typescript
const project = await queryFirst(
  db,
  `SELECT * FROM projects WHERE id = ? AND user_id = ?`,
  projectId,
  userId
);
```

### 3. **Visibility Enforcement**
Public snapshot access properly checks visibility:
```typescript
WHERE ps.id = ? AND p.visibility = 'public'
```

### 4. **SQL Injection Protection**
All queries use parameterized statements:
```typescript
await queryFirst(db, 'SELECT * FROM projects WHERE id = ? AND user_id = ?', projectId, userId);
```

### 5. **Snapshot Immutability**
Snapshots are frozen copies, preventing tampering with published templates.

---

## 🟡 MEDIUM PRIORITY ISSUES

### 1. **No Snapshot Size Limits**
**Location**: `snapshot-service.ts:75-113`

**Issue**: No limits on:
- Number of files per snapshot
- Total snapshot size
- Individual file size

**Recommendation**:
```typescript
const MAX_SNAPSHOT_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES = 1000;

if (projectFiles.length > MAX_FILES) {
  throw new Error('Project has too many files to snapshot');
}

if (totalSize > MAX_SNAPSHOT_SIZE) {
  throw new Error('Project is too large to snapshot');
}
```

### 2. **No Snapshot Quota Per User**
**Issue**: Users can create unlimited snapshots.

**Recommendation**: Add per-user limits based on tier:
```typescript
const snapshotCount = await queryFirst(
  db,
  `SELECT COUNT(*) as count FROM project_snapshots WHERE user_id = ?`,
  userId
);

const MAX_SNAPSHOTS = {
  free: 3,
  plus: 10,
  pro: 50
};

if (snapshotCount.count >= MAX_SNAPSHOTS[userTier]) {
  throw new Error('Snapshot quota exceeded');
}
```

### 3. **Missing Audit Logging**
**Issue**: No audit trail for:
- Snapshot creation
- Snapshot deletion
- Template cloning
- Visibility changes

**Recommendation**: Add audit logging table and log all sensitive operations.

### 4. **No Content Validation**
**Issue**: Snapshot files are not validated for:
- Malicious content
- File type restrictions
- Path traversal attempts

**Recommendation**: Add validation before copying to snapshots.

---

## 🟢 LOW PRIORITY IMPROVEMENTS

### 1. **Add CORS Headers for Public Snapshots**
Allow controlled cross-origin access to public templates.

### 2. **Implement Snapshot Versioning Cleanup**
Add automatic cleanup of old snapshot versions (keep last N versions).

### 3. **Add Snapshot Metadata**
Include creation timestamp, file checksums, and version notes.

### 4. **Implement Soft Delete**
Use soft delete for snapshots to allow recovery.

---

## IMMEDIATE ACTION ITEMS

### Priority 1 (Fix Immediately)
1. ✅ Add authorization to `deleteSnapshot()`
2. ✅ Fix clone API to use snapshots
3. ✅ Add rate limiting to expensive operations

### Priority 2 (Fix This Week)
4. ✅ Add snapshot size limits
5. ✅ Add per-user snapshot quotas
6. ✅ Sanitize error messages

### Priority 3 (Plan for Next Sprint)
7. ⏳ Implement audit logging
8. ⏳ Add content validation
9. ⏳ Add snapshot cleanup policies

---

## TESTING RECOMMENDATIONS

### Security Tests to Add
1. **Authorization Tests**
   - Try to delete someone else's snapshot
   - Try to republish someone else's project
   - Try to access private snapshots

2. **Rate Limiting Tests**
   - Rapid republish attempts
   - Mass cloning attempts
   - Concurrent snapshot creation

3. **Input Validation Tests**
   - Oversized projects
   - Too many files
   - Invalid file paths

4. **SQL Injection Tests**
   - Test all query parameters
   - Test with malicious inputs

---

## COMPLIANCE NOTES

### Data Privacy
- ✅ Snapshots only expose public projects
- ✅ User IDs are not exposed in public APIs
- ⚠️ Need to add GDPR deletion support for snapshots

### Resource Limits
- ⚠️ No quotas or limits currently enforced
- ⚠️ Could lead to resource exhaustion

### Access Control
- ✅ Proper authentication on mutation endpoints
- ✅ Ownership verification on sensitive operations
- ⚠️ Missing authorization on some service functions

---

## CONCLUSION

The snapshot system has a **solid foundation** with proper authentication and SQL injection protection, but requires **immediate fixes** for:

1. Authorization in snapshot deletion
2. Clone API using snapshots
3. Rate limiting on expensive operations

Once these critical issues are addressed, the system will be **production-ready** with appropriate security controls.

**Overall Security Rating**: 🟡 **MEDIUM** (Good foundation, critical fixes needed)

---

## APPENDIX: Security Checklist

- [x] Authentication on all mutation endpoints
- [x] Authorization on project operations
- [ ] Authorization on snapshot deletion ❌
- [x] SQL injection protection
- [x] Visibility enforcement
- [ ] Rate limiting ❌
- [ ] Input validation
- [ ] Audit logging
- [ ] Error message sanitization
- [ ] Resource quotas
- [ ] Content validation
- [ ] GDPR compliance

