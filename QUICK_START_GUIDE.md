# OtterAI - Quick Start Guide for LLMs

**Purpose:** Fast reference for LLMs to quickly understand and work with this codebase

---

## 🚀 One-Minute Overview

**What is this?** A Remix app combining the original Bolt.new editor with a new SaaS platform for template management and user projects.

**Tech Stack:**
- Remix v2 + React 18
- Nanostores (state)
- UnoCSS + SCSS (styling)
- TypeScript (strict mode)
- Cloudflare Pages/Workers

**Two Modes:**
1. **Editor Mode** (`/`) - Original Bolt.new functionality (DO NOT MODIFY)
2. **Platform Mode** (`/home`, `/dashboard`, etc.) - New SaaS features (SAFE TO MODIFY)

---

## 📁 Key Directories

```
app/
├── components/platform/   ✅ NEW - Platform UI (safe to modify)
├── components/chat/       ⚠️  ORIGINAL - Editor chat (don't touch)
├── components/workbench/  ⚠️  ORIGINAL - Editor workbench (don't touch)
├── lib/stores/platform/   ✅ NEW - Platform state (safe to modify)
├── lib/types/platform/    ✅ NEW - Platform types (safe to modify)
├── lib/mock/              ✅ NEW - Mock data (safe to modify)
├── routes/[new routes]    ✅ NEW - Platform pages (safe to modify)
└── styles/platform/       ✅ NEW - Platform styles (safe to modify)
```

---

## 🎯 Common Tasks

### Task 1: Add a New Page
```typescript
// 1. Create route file: app/routes/my-page.tsx
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';

export default function MyPage() {
  return (
    <PlatformLayout>
      <div className="min-h-screen bg-bg-1 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Your content */}
        </div>
      </div>
    </PlatformLayout>
  );
}

// 2. Add link in PlatformNav.tsx (if needed)
```

### Task 2: Add a New Component
```typescript
// 1. Create file: app/components/platform/[category]/MyComponent.tsx
interface MyComponentProps {
  // Define props
}

export function MyComponent({ }: MyComponentProps) {
  return (
    <div className="bg-white dark:bg-bg-2 border border-border-primary rounded-xl p-6">
      {/* Component content */}
    </div>
  );
}

// 2. Export from component if needed
```

### Task 3: Add New State
```typescript
// 1. Create store: app/lib/stores/platform/my-store.ts
import { atom } from 'nanostores';

export interface MyState {
  // Define state shape
}

export const myStore = atom<MyState>({
  // Initial state
});

// 2. Create hook: app/lib/hooks/platform/useMyState.ts
import { useStore } from '@nanostores/react';
import { myStore } from '~/lib/stores/platform/my-store';

export function useMyState() {
  const state = useStore(myStore);
  return { state };
}

// 3. Use in component
const { state } = useMyState();
```

### Task 4: Add Mock Data
```typescript
// 1. Create types: app/lib/types/platform/my-type.ts
export interface MyData {
  id: string;
  name: string;
  // ...
}

// 2. Create mock data: app/lib/mock/my-data.ts
import type { MyData } from '~/lib/types/platform/my-type';

export const mockMyData: MyData[] = [
  { id: '1', name: 'Example' },
  // ...
];

// 3. Use in store or component
import { mockMyData } from '~/lib/mock/my-data';
```

---

## 🎨 Styling Patterns

### Colors (Always use CSS variables)
```tsx
// Backgrounds
className="bg-bg-1"          // Light cream / Pure black
className="bg-bg-2"          // Lighter / Dark gray
className="bg-bg-3"          // Main content
className="bg-bg-4"          // Cards/elements

// Text
className="text-text-primary"    // Main text
className="text-text-secondary"  // Secondary text
className="text-text-tertiary"   // Tertiary text

// Borders
className="border-border-primary"    // Main borders
className="border-border-secondary"  // Lighter borders

// Brand
className="bg-[#e86b47]"           // Primary orange
className="hover:bg-[#d45a36]"     // Hover state
className="text-[#e86b47]"         // Orange text
```

### Common Component Patterns
```tsx
// Card
<div className="bg-white dark:bg-bg-2 border border-border-primary dark:border-border-primary rounded-xl p-6 hover:shadow-lg dark:hover:shadow-xl transition-all">

// Button (Primary)
<button className="px-4 py-2 bg-[#e86b47] text-white rounded-md hover:bg-[#d45a36] transition-all">

// Button (Secondary)
<button className="px-4 py-2 border border-border-primary text-text-primary rounded-md hover:bg-bg-2 transition-all">

// Input
<input className="w-full px-4 py-3 bg-white dark:bg-bg-4 border border-border-primary rounded-lg text-text-primary dark:text-white focus:ring-2 focus:ring-[#e86b47]" />

// Section Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
```

---

## 🔍 Where Things Are

### Authentication
- **Store:** `app/lib/stores/platform/auth.ts` (mocked as logged in)
- **Hook:** `app/lib/hooks/platform/useAuth.ts`
- **Components:** `app/components/platform/auth/`

### Templates
- **Types:** `app/lib/types/platform/template.ts`
- **Mock Data:** `app/lib/mock/templates.ts` (8 templates)
- **Store:** `app/lib/stores/platform/templates.ts`
- **Components:** `app/components/platform/templates/`
- **Routes:** `app/routes/templates.tsx`, `app/routes/templates.$id.tsx`

### Projects
- **Types:** `app/lib/types/platform/project.ts`
- **Mock Data:** `app/lib/mock/projects.ts` (5 projects)
- **Store:** `app/lib/stores/platform/projects.ts`
- **Components:** `app/components/platform/projects/`
- **Routes:** `app/routes/projects.tsx`, `app/routes/dashboard.tsx`

### User/Settings
- **Types:** `app/lib/types/platform/user.ts`
- **Mock Data:** `app/lib/mock/users.ts`
- **Store:** `app/lib/stores/platform/user.ts`
- **Components:** `app/components/platform/settings/`
- **Routes:** `app/routes/settings.*.tsx`

### Navigation/Layout
- **Nav:** `app/components/platform/layout/PlatformNav.tsx`
- **Layout:** `app/components/platform/layout/PlatformLayout.tsx`
- **Footer:** `app/components/platform/layout/Footer.tsx`
- **Theme Toggle:** `app/components/ui/ThemeToggle.tsx`

---

## ⚡ Quick Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:5173)
pnpm build            # Build for production
pnpm typecheck        # Check TypeScript errors
pnpm lint             # Run ESLint

# Testing URLs
http://localhost:5173/           # Editor (original)
http://localhost:5173/home       # Landing page
http://localhost:5173/dashboard  # User dashboard
http://localhost:5173/templates  # Template browser
http://localhost:5173/pricing    # Pricing page
```

---

## ⚠️ Critical Rules

### DO NOT:
- ❌ Modify components in `app/components/chat/`
- ❌ Modify components in `app/components/workbench/`
- ❌ Modify components in `app/components/editor/`
- ❌ Change existing stores (`chat.ts`, `editor.ts`, `files.ts`, etc.)
- ❌ Modify the original `_index.tsx` route functionality
- ❌ Break the WebContainer integration

### DO:
- ✅ Add new files in `app/components/platform/`
- ✅ Create new routes for platform features
- ✅ Add new stores in `app/lib/stores/platform/`
- ✅ Extend mock data in `app/lib/mock/`
- ✅ Add platform-specific styles in `app/styles/platform/`
- ✅ Use existing design tokens and patterns

---

## 🐛 Common Issues

### Issue: TypeScript errors
**Solution:** Run `pnpm typecheck` to see all errors. Most common:
- Missing type definitions
- Incorrect type usage
- Unused imports

### Issue: Theme not working
**Solution:** Ensure you're using CSS variables, not hardcoded colors:
```tsx
// ❌ Wrong
className="bg-white text-black"

// ✅ Correct
className="bg-bg-1 text-text-primary"
```

### Issue: Component not updating
**Solution:** Check if you're using nanostores correctly:
```tsx
// ❌ Wrong
const user = userStore.get();

// ✅ Correct
const user = useStore(userStore);
```

### Issue: Styling looks wrong
**Solution:** 
1. Check if dark mode classes are present
2. Verify CSS variable usage
3. Ensure responsive classes are included

---

## 📚 Key Files Reference

**Must Read:**
1. `app/root.tsx` - App structure and providers
2. `app/components/platform/layout/PlatformNav.tsx` - Navigation pattern
3. `app/styles/platform/colors.scss` - Color system
4. `app/lib/stores/theme.ts` - Theme management

**Templates for Common Tasks:**
- New page: `app/routes/dashboard.tsx`
- New component: `app/components/platform/templates/TemplateCard.tsx`
- New store: `app/lib/stores/platform/auth.ts`
- New type: `app/lib/types/platform/user.ts`

---

## 🎓 Learning Path

**If you're new to this codebase:**
1. Read `LLM_CODEBASE_DOCUMENTATION.md` (comprehensive guide)
2. Review the route structure in `app/routes/`
3. Look at existing platform components for patterns
4. Check the type definitions to understand data shapes
5. Explore the styling system in `app/styles/platform/`

**For quick modifications:**
1. Find similar existing code
2. Copy the pattern
3. Modify for your needs
4. Test in both light and dark mode
5. Run `pnpm typecheck` to verify

---

This quick start guide should get you productive immediately. For deeper understanding, refer to the comprehensive `LLM_CODEBASE_DOCUMENTATION.md`.
