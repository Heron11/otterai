# Public Projects - Clone Button Locations

## Overview
When a user views a **public project** (one they don't own), they will see **clone buttons** in multiple locations to make it easy to create their own editable copy.

## Clone Button Locations

### 1. **View-Only Banner** (Top of Workbench)
- **Location**: Between the workbench header and the content area
- **File**: `app/components/workbench/ViewOnlyBanner.tsx`
- **Visibility**: Shows when viewing someone else's public project
- **Design**: Yellow/orange gradient banner with project info and clone button
- **Implementation**: Added to `Workbench.client.tsx` (line 234-239)

**Current Status**: ✅ Component created, conditionally rendered (currently disabled with `{false && ...}`)

### 2. **Floating Button in Code Editor**
- **Location**: Bottom-right corner of the code editor panel
- **File**: `app/components/workbench/EditorPanel.tsx`
- **Visibility**: Shows when in "Code" view of a public project
- **Design**: Floating orange button with shadow
- **Implementation**: Added to `EditorPanel.tsx` (line 181-194)

**Current Status**: ✅ Component added, conditionally rendered (currently disabled with `{false && ...}`)

### 3. **Floating Button in Preview Panel**
- **Location**: Bottom-right corner of the preview iframe
- **File**: `app/components/workbench/Preview.tsx`
- **Visibility**: Shows when in "Preview" view of a public project
- **Design**: Floating orange button with shadow, overlays the preview
- **Implementation**: Added to `Preview.tsx` (line 122-135)

**Current Status**: ✅ Component added, conditionally rendered (currently disabled with `{false && ...}`)

### 4. **Visibility Toggle** (Workbench Header)
- **Location**: In the workbench header, next to Save and Download buttons
- **File**: `app/components/workbench/VisibilityToggle.tsx`
- **Visibility**: Shows for project owners only
- **Design**: Three-button toggle (Private/Unlisted/Public)
- **Implementation**: Added to `Workbench.client.tsx` (line 217-220)

**Current Status**: ✅ Component created and rendered

## Activation Requirements

All clone buttons are currently **disabled** (wrapped in `{false && ...}`) and require the following logic to be implemented:

```typescript
// Check if current user is NOT the owner AND project is public
const isViewOnly = !access.isOwner && access.canView && !access.canEdit;
```

### Required Data Flow:
1. Load project access data from API (`/api/projects/:id/files`)
2. API returns `access` object with:
   - `canEdit`: boolean
   - `canClone`: boolean
   - `isOwner`: boolean
   - `isCloned`: boolean
   - `accessType`: 'owner' | 'viewer' | 'none'
3. Pass `access` data to workbench components
4. Update conditionals from `{false && ...}` to `{isViewOnly && ...}`

### Example Implementation:
```typescript
// In Workbench.client.tsx
const [projectAccess, setProjectAccess] = useState<ProjectAccess | null>(null);

useEffect(() => {
  // Load project access when project loads
  if (currentChatId) {
    fetch(`/api/projects/${currentChatId}/files`)
      .then(res => res.json())
      .then(data => {
        if (data.access) {
          setProjectAccess(data.access);
        }
      });
  }
}, [currentChatId]);

const isViewOnly = projectAccess && !projectAccess.canEdit && projectAccess.canView;

// Then use in conditionals:
{isViewOnly && (
  <ViewOnlyBanner 
    projectId={currentChatId || ''} 
    projectName={workbenchStore.firstArtifact?.title || 'this project'}
  />
)}
```

## Clone Functionality

All clone buttons call the same API endpoint:

```typescript
POST /api/projects/:projectId/clone
```

**Response**:
```json
{
  "success": true,
  "projectId": "new_project_id",
  "redirectUrl": "/chat/new_project_id"
}
```

The implementation automatically:
1. Creates a new project owned by the current user
2. Copies all files from the original project
3. Sets the new project as private by default
4. Redirects to the new project for editing
5. Updates clone count on the original project

## UI/UX Flow

### Viewing a Public Project:
1. User clicks on a public project or visits a preview link
2. View-only banner appears at the top
3. Floating clone buttons appear in code/preview areas
4. User cannot edit files (editor is read-only)
5. Save button is disabled or hidden

### Cloning a Project:
1. User clicks any "Clone to Edit" button
2. API creates a copy of the project
3. User is redirected to their new copy
4. New project has full edit access
5. New project is marked as private by default

## Related Files

- `app/lib/.server/projects/access-control.ts` - Access control logic
- `app/routes/api.projects.$projectId.clone.ts` - Clone API endpoint
- `app/routes/api.projects.$projectId.files.ts` - File access with permission checks
- `app/routes/api.projects.$projectId.visibility.ts` - Visibility update endpoint
- `app/components/projects/AccessIndicator.tsx` - Access level badges
- `app/components/projects/ViewOnlyPreview.tsx` - Preview component for public projects
- `app/components/platform/projects/PublicProjectCard.tsx` - Project card with clone button

## Next Steps

1. ✅ Create access control system
2. ✅ Add clone API endpoint
3. ✅ Create UI components for clone buttons
4. ✅ Add visibility toggle
5. ⏳ Implement access data loading in workbench
6. ⏳ Enable clone buttons based on access permissions
7. ⏳ Add read-only mode to editor when viewing public projects
8. ⏳ Test clone functionality end-to-end
