# OtterAI Codebase Documentation for LLMs

**Last Updated:** January 2025  
**Purpose:** Comprehensive documentation to help LLMs understand and work with this codebase effectively

---

## 🎯 Project Overview

### What is OtterAI?
OtterAI is a **dual-purpose application** built on Remix that combines:
1. **Original Bolt.new functionality** - AI-powered code editor with WebContainer integration
2. **New SaaS Platform** - Template marketplace, user management, and project dashboard

### Key Architecture Points
- **Framework:** Remix v2.10.2 with Cloudflare Pages
- **State Management:** Nanostores for reactive state
- **Styling:** UnoCSS + custom SCSS with CSS variables
- **Runtime:** Cloudflare Workers with WebContainer for code execution
- **Build Tool:** Vite with TypeScript

---

## 📁 Critical File Structure

```
otterai/
├── app/                          # Main application code
│   ├── components/              # React components
│   │   ├── chat/               # Original chat/editor components
│   │   ├── workbench/          # Original editor workbench
│   │   ├── platform/           # NEW: SaaS platform components
│   │   └── ui/                 # Shared UI components
│   ├── lib/                    # Core libraries and utilities
│   │   ├── stores/             # Nanostores state management
│   │   │   ├── platform/       # NEW: Platform-specific stores
│   │   │   └── [original]      # Original stores (chat, editor, etc.)
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── platform/       # NEW: Platform types
│   │   ├── hooks/              # React hooks
│   │   │   └── platform/       # NEW: Platform hooks
│   │   ├── mock/               # NEW: Mock data for development
│   │   └── utils/              # Utility functions
│   ├── routes/                 # Remix routes
│   │   ├── _index.tsx          # Original editor (/) 
│   │   ├── home.tsx            # NEW: Landing page (/home)
│   │   ├── dashboard.tsx       # NEW: User dashboard
│   │   ├── templates.tsx       # NEW: Template browser
│   │   └── [platform routes]   # NEW: Auth, settings, etc.
│   ├── styles/                 # Styling
│   │   ├── platform/           # NEW: Platform-specific styles
│   │   └── [original styles]   # Original styling
│   └── root.tsx               # App root component
├── public/                     # Static assets
│   ├── [brand assets]         # NEW: Logos, images from hai-production
│   └── [original assets]      # Original assets
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── wrangler.toml             # Cloudflare Workers config
```

---

## 🏗️ Architecture Patterns

### 1. Dual-Mode Application
The app operates in two distinct modes:

**Original Mode (`/` route):**
- Full Bolt.new editor functionality
- WebContainer integration for code execution
- AI-powered code generation
- Chat interface for iteration

**Platform Mode (`/home`, `/dashboard`, etc.):**
- SaaS platform UI
- User authentication and management
- Template marketplace
- Project dashboard

### 2. State Management Strategy

**Nanostores Pattern:**
```typescript
// Store definition
import { atom } from 'nanostores';
export const userStore = atom<User | null>(null);

// Usage in components
import { useStore } from '@nanostores/react';
const user = useStore(userStore);
```

**Store Categories:**
- **Original Stores:** `chat`, `editor`, `files`, `workbench`, `theme`
- **Platform Stores:** `platform/auth`, `platform/user`, `platform/templates`, `platform/projects`

### 3. Component Architecture

**Layout Components:**
- `PlatformLayout` - Wrapper for platform pages with header/footer
- `PlatformNav` - Navigation bar with theme toggle and user menu
- Original `Header` - Used only in editor mode

**Component Naming Convention:**
- Platform components: `app/components/platform/[category]/`
- Original components: `app/components/[category]/`
- Shared components: `app/components/ui/`

---

## 🔧 Key Technical Patterns

### 1. Route Structure (Remix)

**Original Routes:**
```typescript
// app/routes/_index.tsx - Main editor
export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <PlatformNav />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
```

**Platform Routes:**
```typescript
// app/routes/dashboard.tsx - User dashboard
export default function DashboardPage() {
  const { userProfile } = useUser();
  return (
    <PlatformLayout>
      {/* Dashboard content */}
    </PlatformLayout>
  );
}
```

### 2. Type System

**Platform Types:**
```typescript
// app/lib/types/platform/user.ts
export type UserTier = 'free' | 'plus' | 'pro';
export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  // ...
}
```

**Template Types:**
```typescript
// app/lib/types/platform/template.ts
export interface Template {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  category: TemplateCategory;
  framework: TemplateFramework;
  requiredTier: UserTier;
  // ...
}
```

### 3. Styling System

**CSS Variables (Light/Dark Mode):**
```scss
// app/styles/platform/colors.scss
:root {
  --brand-primary: #e86b47;
  --build-chat-colors-bg-1: #fefaf8;
  --build-chat-colors-text-primary: #000000;
}

.dark {
  --build-chat-colors-bg-1: #000000;
  --build-chat-colors-text-primary: #ffffff;
}
```

**Utility Classes:**
```scss
.bg-bg-1 { background-color: var(--build-chat-colors-bg-1); }
.text-text-primary { color: var(--build-chat-colors-text-primary); }
```

---

## 🎨 Design System

### Color Palette
- **Primary Brand:** `#e86b47` (orange)
- **Backgrounds:** CSS variables for light/dark themes
- **Text:** Primary, secondary, tertiary text colors
- **Borders:** Subtle borders with opacity variations

### Component Patterns

**Cards:**
```typescript
<div className="bg-white dark:bg-bg-2 border border-border-primary rounded-xl p-6 hover:shadow-lg transition-all">
  {/* Card content */}
</div>
```

**Buttons:**
```typescript
<button className="px-4 py-2 bg-[#e86b47] text-white rounded-md hover:bg-[#d45a36] transition-all">
  {/* Button content */}
</button>
```

### Animation System
- **Framer Motion** for page transitions and micro-interactions
- **CSS transitions** for hover effects and state changes
- **Lottie animations** for loading states and illustrations

---

## 🔄 Data Flow Patterns

### 1. Authentication Flow
```typescript
// Mock authentication for development
const authStore = map<AuthState>({
  isAuthenticated: true, // Set to true for UI development
  user: mockUser,
  loading: false,
  error: null,
});
```

### 2. Template Management
```typescript
// Templates are stored as mock data with GitHub URLs
export const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'React + Vite Starter',
    githubUrl: 'https://github.com/vitejs/vite',
    requiredTier: 'free',
    // ...
  }
];
```

### 3. Project Management
```typescript
// Projects track user's created applications
export interface Project {
  id: string;
  userId: string;
  name: string;
  templateId?: string;
  status: ProjectStatus;
  lastModified: Date;
  // ...
}
```

---

## 🛠️ Development Patterns

### 1. Mock Data Strategy
All platform features use mock data for development:
- **Users:** Mock user profiles with different tiers
- **Templates:** 8 predefined templates with metadata
- **Projects:** Sample user projects
- **Authentication:** Mocked as authenticated state

### 2. Component Development
```typescript
// Platform components follow this pattern:
export function ProjectCard({ project }: ProjectCardProps) {
  const { canAccessTemplate } = useSubscription();
  const hasAccess = canAccessTemplate(project.requiredTier);
  
  return (
    <div className="group bg-white dark:bg-bg-2 border border-border-primary rounded-xl overflow-hidden">
      {/* Component content */}
    </div>
  );
}
```

### 3. Hook Patterns
```typescript
// Custom hooks for platform functionality
export function useUser() {
  const userProfile = useStore(userProfileStore);
  const { user } = useAuth();
  
  return {
    userProfile,
    isAuthenticated: !!user,
    // ...
  };
}
```

---

## 🚀 Build and Deployment

### Development Commands
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm deploy       # Deploy to Cloudflare Pages
```

### Environment Setup
- **Node.js:** >=18.18.0
- **Package Manager:** pnpm@9.4.0
- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (not yet implemented)

### Build Configuration
- **Vite** for bundling and development
- **Remix** for SSR and routing
- **TypeScript** with strict mode
- **UnoCSS** for styling

---

## 🔍 Key Integration Points

### 1. WebContainer Integration
The original editor uses WebContainer for code execution:
```typescript
// app/lib/stores/workbench.ts
export class WorkbenchStore {
  #previewsStore = new PreviewsStore(webcontainer);
  #filesStore = new FilesStore(webcontainer);
  // ...
}
```

### 2. Theme System
Unified theme management across both modes:
```typescript
// app/lib/stores/theme.ts
export const themeStore = atom<Theme>(initStore());
export function toggleTheme() {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  themeStore.set(newTheme);
  document.querySelector('html')?.setAttribute('data-theme', newTheme);
}
```

### 3. Navigation Integration
Platform navigation is used in both modes:
```typescript
// app/routes/_index.tsx - Editor with platform nav
export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <PlatformNav />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
```

---

## 📝 Important Notes for LLMs

### 1. Code Modification Guidelines
- **NEVER modify original chat/editor functionality** - it must remain intact
- **All new code goes in `platform/` directories** or new route files
- **Use existing design tokens and patterns** for consistency
- **Follow TypeScript strict mode** - all types must be properly defined

### 2. Component Development Rules
- **Platform components:** Use `PlatformLayout` wrapper
- **Original components:** Keep existing patterns unchanged
- **Shared components:** Place in `app/components/ui/`
- **Always support both light and dark themes**

### 3. State Management Rules
- **Use Nanostores** for all reactive state
- **Separate platform stores** from original stores
- **Mock data for development** - don't implement real APIs yet
- **Type safety is critical** - define interfaces for all data

### 4. Styling Guidelines
- **Use CSS variables** for colors and spacing
- **Follow existing naming conventions** (bg-bg-1, text-text-primary, etc.)
- **Support both themes** with proper dark mode variants
- **Use UnoCSS classes** for utility styling

### 5. Route Development
- **Platform routes:** Use `PlatformLayout` and proper meta tags
- **Original routes:** Don't modify existing functionality
- **File-based routing:** Follow Remix conventions
- **TypeScript:** Define proper loader and action types

---

## 🔧 Common Tasks for LLMs

### Adding New Platform Features
1. Create types in `app/lib/types/platform/`
2. Add mock data in `app/lib/mock/`
3. Create stores in `app/lib/stores/platform/`
4. Build components in `app/components/platform/`
5. Add routes in `app/routes/`
6. Update navigation if needed

### Modifying Existing Features
1. **Platform features:** Safe to modify
2. **Original features:** Only modify if explicitly requested
3. **Shared components:** Update carefully, test both modes
4. **Styling:** Use existing design system

### Debugging Issues
1. **Check TypeScript errors** first
2. **Verify theme support** in both light/dark modes
3. **Test responsive design** on different screen sizes
4. **Ensure original functionality** still works
5. **Check console for errors** in browser dev tools

---

## 📚 Additional Resources

### Key Dependencies
- **Remix:** Full-stack React framework
- **Nanostores:** Lightweight state management
- **Framer Motion:** Animation library
- **UnoCSS:** Atomic CSS engine
- **WebContainer:** Browser-based Node.js runtime

### Important Files to Reference
- `app/root.tsx` - App root and providers
- `app/lib/stores/theme.ts` - Theme management
- `app/styles/platform/colors.scss` - Color system
- `app/components/platform/layout/PlatformNav.tsx` - Navigation
- `app/lib/types/platform/` - All platform type definitions

### Development Workflow
1. Start with `pnpm dev`
2. Navigate to `http://localhost:5173`
3. Test both editor (`/`) and platform (`/home`, `/dashboard`) modes
4. Use browser dev tools to inspect components
5. Check TypeScript compilation with `pnpm typecheck`

---

This documentation provides LLMs with the essential context needed to understand and work with the OtterAI codebase effectively. Always prioritize maintaining the original functionality while extending the platform features as needed.
