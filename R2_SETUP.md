# R2 File Storage Setup Guide

This guide explains how to set up and use Cloudflare R2 for project file storage in OtterAI.

## 📋 Prerequisites

- Cloudflare account with R2 enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Local development environment set up

---

## 🚀 Setup Steps

### 1. Create R2 Buckets

You need to create TWO R2 buckets (one for production, one for development):

#### Production Bucket
```bash
wrangler r2 bucket create otterai-projects
```

#### Development Bucket
```bash
wrangler r2 bucket create otterai-projects-dev
```

**Output:**
```
Created bucket 'otterai-projects' with default storage class set to Standard.
Created bucket 'otterai-projects-dev' with default storage class set to Standard.
```

### 2. Verify Configuration

Check that `wrangler.toml` has the R2 binding (already configured):

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "otterai-projects"
preview_bucket_name = "otterai-projects-dev"
```

### 3. Test Local Access

For local development, Wrangler will use the dev bucket automatically.

Start your dev server:
```bash
cd /Users/heron/Desktop/otter2/otterai
pnpm dev
```

Wrangler will connect to `otterai-projects-dev` when running locally.

---

## 🧪 Testing R2 Integration

### Test File Upload

```typescript
// Example: Save files via API
const response = await fetch('/api/projects/proj_123/files', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    files: {
      'src/App.tsx': 'export default function App() { ... }',
      'src/index.css': 'body { margin: 0; }',
      'package.json': '{ "name": "my-project" }',
    }
  })
});

const result = await response.json();
// { success: true, projectId: "proj_123", saved: 3, failed: 0 }
```

### Test File Retrieval

```typescript
// Example: Load files via API
const response = await fetch('/api/projects/proj_123/files');
const { files } = await response.json();

// files = {
//   'src/App.tsx': '...',
//   'src/index.css': '...',
//   'package.json': '...'
// }
```

---

## 📦 R2 Bucket Structure

Files are organized by project:

```
otterai-projects/
├── projects/
│   ├── proj_abc123/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── index.tsx
│   │   │   └── styles.css
│   │   ├── public/
│   │   │   └── index.html
│   │   └── package.json
│   ├── proj_def456/
│   │   └── ...
│   └── proj_ghi789/
│       └── ...
```

---

## 💾 Database Integration

R2 files are indexed in the D1 database:

### Projects Table
```sql
projects (
  id,
  user_id,
  name,
  r2_path,           -- e.g., "projects/proj_123/"
  file_count,        -- Number of files
  total_size,        -- Total bytes
  ...
)
```

### Project Files Index
```sql
project_files (
  id,
  project_id,
  user_id,
  file_path,         -- e.g., "src/App.tsx"
  r2_key,            -- e.g., "projects/proj_123/src/App.tsx"
  file_size,
  content_type,
  ...
)
```

---

## 🔧 API Endpoints

### Save Project Files
```
POST /api/projects/:projectId/files
Content-Type: application/json

{
  "files": {
    "path/to/file.ts": "file content here",
    "another/file.css": "more content"
  }
}
```

### Load Project Files
```
GET /api/projects/:projectId/files

Response:
{
  "success": true,
  "projectId": "proj_123",
  "files": {
    "path/to/file.ts": "file content here"
  },
  "count": 1
}
```

---

## 🔍 Debugging

### Check if R2 is accessible

```bash
# List buckets
wrangler r2 bucket list

# List objects in a bucket
wrangler r2 object list otterai-projects-dev

# Get a specific file
wrangler r2 object get otterai-projects-dev/projects/proj_123/src/App.tsx
```

### Common Issues

**1. "R2_BUCKET is not defined"**
- Make sure `wrangler.toml` has the R2 binding
- Restart your dev server after changing `wrangler.toml`

**2. "Bucket not found"**
- Create the bucket: `wrangler r2 bucket create otterai-projects-dev`
- Verify bucket name matches `wrangler.toml`

**3. "Permission denied"**
- Run `wrangler login` to re-authenticate
- Check you're logged into the correct Cloudflare account

---

## 💰 Cost Estimates

### Free Tier (per month)
- ✅ 10 GB storage
- ✅ 1 million Class A operations (writes)
- ✅ 10 million Class B operations (reads)
- ✅ **Unlimited egress (no bandwidth fees!)**

### Paid Tier (after free tier)
- Storage: $0.015/GB/month
- Class A (PUT, POST, LIST): $4.50/million
- Class B (GET, HEAD): $0.36/million
- Egress: **$0** (always free!)

### Example Usage Costs

**100 users, 10 projects each, 50 files per project:**
- Storage: ~500 MB = **$0.0075/month**
- Reads: ~100K/month = **Free**
- Writes: ~50K/month = **Free**
- **Total: Less than 1 cent/month**

---

## 🚀 Production Deployment

When deploying to Cloudflare Pages:

1. **Set Environment Variables** (if needed):
   ```bash
   wrangler pages secret put R2_BUCKET_NAME
   # Enter: otterai-projects
   ```

2. **Deploy:**
   ```bash
   pnpm run deploy
   ```

3. **Verify R2 Binding:**
   - Go to Cloudflare Dashboard > Pages > Your Project
   - Click **Settings** > **Functions**
   - Verify R2 bucket binding is shown

---

## ✅ Checklist

- [ ] Created R2 buckets (production & dev)
- [ ] Updated `wrangler.toml` with bucket names
- [ ] Added R2_BUCKET to TypeScript types
- [ ] Created R2 service module
- [ ] Updated database schema
- [ ] Created API routes for file operations
- [ ] Tested file upload/download locally
- [ ] Ready for production deployment

---

## 📚 Resources

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Wrangler R2 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#r2)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)


