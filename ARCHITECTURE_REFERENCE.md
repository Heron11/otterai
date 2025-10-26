# OtterAI - Architecture Reference for LLMs

**Purpose:** Technical reference for understanding the system architecture and making informed decisions

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     OtterAI Application                         │
│                     (Remix + Cloudflare)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                      ┌──────────────────┐
│  Platform Mode   │                      │   Editor Mode    │
│   (/home, etc.)  │                      │      (/)         │
└──────────────────┘                      └──────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌──────────────────┐                      ┌──────────────────┐
│ Platform UI      │                      │ Original Bolt    │
│ - Dashboard      │                      │ - Chat Interface │
│ - Templates      │                      │ - Code Editor    │
│ - Projects       │                      │ - WebContainer   │
│ - Settings       │                      │ - File System    │
└──────────────────┘                      └──────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌──────────────────┐                      ┌──────────────────┐
│ Nanostores       │                      │ Nanostores       │
│ - auth           │                      │ - chat           │
│ - user           │                      │ - editor         │
│ - templates      │                      │ - files          │
│ - projects       │                      │ - workbench      │
└──────────────────┘                      └──────────────────┘
        │                                           │
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Shared Services │
                    │  - Theme Store   │
                    │  - Settings      │
                    └──────────────────┘
```

---

## 🔄 Request Flow

### Platform Routes Flow
```
User navigates to /dashboard
    │
    ▼
Remix handles routing
    │
    ▼
app/routes/dashboard.tsx loader (if defined)
    │
    ▼
React component renders
    │
    ▼
useStore hooks pull from Nanostores
    │
    ▼
Components read from stores (auth, user, projects)
    │
    ▼
UI renders with current state
    │
    ▼
User interactions update stores
    │
    ▼
Reactive updates trigger re-renders
```

### Editor Route Flow
```
User navigates to /
    │
    ▼
app/routes/_index.tsx renders
    │
    ▼
<ClientOnly> wrapper for Chat component
    │
    ▼
Chat component initializes
    │
    ▼
WebContainer starts (if needed)
    │
    ▼
User sends prompt
    │
    ▼
AI processing (would connect to backend)
    │
    ▼
Code generation and file creation
    │
    ▼
Files written to WebContainer
    │
    ▼
Preview updates in real-time
```

---

## 📊 State Management Architecture

### Nanostore Pattern
```typescript
// Store Definition
import { atom, map } from 'nanostores';

// Simple atom store
export const countStore = atom<number>(0);

// Map store (like object)
export const userStore = map<User>({
  id: '1',
  name: 'User',
});

// Store actions
export function incrementCount() {
  countStore.set(countStore.get() + 1);
}

export function updateUser(updates: Partial<User>) {
  const current = userStore.get();
  userStore.set({ ...current, ...updates });
}
```

### Store Organization
```
app/lib/stores/
├── platform/           # Platform-specific stores
│   ├── auth.ts        # Authentication state
│   ├── user.ts        # User profile & subscription
│   ├── templates.ts   # Template catalog
│   └── projects.ts    # User projects
├── chat.ts            # Original: Chat messages
├── editor.ts          # Original: Editor state
├── files.ts           # Original: File system
├── workbench.ts       # Original: Workbench state
├── theme.ts           # Shared: Theme management
└── settings.ts        # Shared: User settings
```

### Store Usage in Components
```typescript
// In a component
import { useStore } from '@nanostores/react';
import { userProfileStore } from '~/lib/stores/platform/user';

export function MyComponent() {
  // Reactive: re-renders when store changes
  const userProfile = useStore(userProfileStore);
  
  // Access store data
  if (!userProfile) return <div>Loading...</div>;
  
  return <div>Welcome, {userProfile.name}!</div>;
}
```

---

## 🎨 Styling Architecture

### CSS Variable System
```scss
// Light mode (default)
:root {
  --brand-primary: #e86b47;
  --build-chat-colors-bg-1: #fefaf8;  // Lightest
  --build-chat-colors-bg-2: #fdf6f2;  // Light
  --build-chat-colors-bg-3: #faf4ef;  // Main
  --build-chat-colors-bg-4: #f5ede5;  // Cards
  --build-chat-colors-text-primary: #000000;
  --build-chat-colors-border-primary: #e8dfd6;
}

// Dark mode
.dark {
  --build-chat-colors-bg-1: #000000;  // Pure black
  --build-chat-colors-bg-2: #111111;  // Elevated
  --build-chat-colors-bg-3: #000000;  // Main
  --build-chat-colors-bg-4: #1a1a1a;  // Cards
  --build-chat-colors-text-primary: #ffffff;
  --build-chat-colors-border-primary: rgba(255, 255, 255, 0.08);
}
```

### Style Layers
```
1. UnoCSS (Utility-first)
   - Margin, padding, flex, grid, etc.
   - Generated at build time

2. Global Styles (app/styles/index.scss)
   - CSS reset
   - Custom variables
   - Component styles

3. Platform Styles (app/styles/platform/)
   - colors.scss - Color system
   - enhanced.scss - Animations, effects

4. Component Styles (*.module.scss)
   - Component-specific styles
   - Scoped to component
```

---

## 🧩 Component Architecture

### Component Hierarchy
```
App (root.tsx)
├── PlatformNav (shared)
│   ├── Logo
│   ├── Navigation Links
│   ├── ThemeToggle
│   └── User Menu
├── Platform Pages
│   └── PlatformLayout
│       ├── PlatformNav (sticky)
│       ├── Page Content
│       └── Footer
└── Editor Page
    ├── PlatformNav (sticky)
    ├── Chat Interface
    │   ├── Messages
    │   ├── Input
    │   └── Suggestions
    └── Workbench
        ├── File Tree
        ├── Code Editor
        ├── Terminal
        └── Preview
```

### Component Communication Patterns

**1. Props (Parent → Child)**
```typescript
<ProjectCard project={project} onDelete={handleDelete} />
```

**2. Stores (Global State)**
```typescript
// Any component can access
const user = useStore(userProfileStore);
```

**3. Context (Scoped State)**
```typescript
// Not heavily used, prefer stores
```

**4. Events (Child → Parent)**
```typescript
// Via callbacks in props
<Button onClick={handleClick} />
```

---

## 🛣️ Routing Architecture

### Remix File-Based Routing
```
app/routes/
├── _index.tsx                 # /
├── home.tsx                   # /home
├── dashboard.tsx              # /dashboard
├── templates.tsx              # /templates
├── templates.$id.tsx          # /templates/:id
├── projects.tsx               # /projects
├── pricing.tsx                # /pricing
├── login.tsx                  # /login
├── signup.tsx                 # /signup
├── forgot-password.tsx        # /forgot-password
├── settings.tsx               # /settings (layout)
├── settings._index.tsx        # /settings (redirect)
├── settings.profile.tsx       # /settings/profile
├── settings.billing.tsx       # /settings/billing
├── settings.usage.tsx         # /settings/usage
├── chat.$id.tsx              # /chat/:id (original)
├── api.chat.ts               # /api/chat (original)
└── api.enhancer.ts           # /api/enhancer (original)
```

### Route Patterns

**Simple Page:**
```typescript
// app/routes/my-page.tsx
export default function MyPage() {
  return <div>Content</div>;
}
```

**With Loader (Data Fetching):**
```typescript
// app/routes/my-page.tsx
export async function loader() {
  return json({ data: 'value' });
}

export default function MyPage() {
  const { data } = useLoaderData<typeof loader>();
  return <div>{data}</div>;
}
```

**With Action (Form Handling):**
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Handle form submission
  return redirect('/success');
}
```

**Layout Route:**
```typescript
// app/routes/settings.tsx
export default function SettingsLayout() {
  return (
    <div>
      <SettingsSidebar />
      <Outlet /> {/* Child routes render here */}
    </div>
  );
}
```

---

## 🔐 Authentication Architecture (Current State)

### Mock Authentication
```typescript
// app/lib/stores/platform/auth.ts
// Currently mocked for UI development
const initialState: AuthState = {
  isAuthenticated: true,  // Always logged in
  user: mockUser,
  token: 'mock_token_123',
  loading: false,
  error: null,
};
```

### Future Real Authentication
```typescript
// Will need to implement:
1. OAuth providers (Google, GitHub, etc.)
2. JWT token management
3. Session handling
4. Protected routes
5. API authentication
```

### Authorization Pattern (Tiers)
```typescript
// Check if user can access template
export function useSubscription() {
  const userProfile = useStore(userProfileStore);
  
  const canAccessTemplate = (requiredTier: UserTier) => {
    const tierOrder = { free: 0, plus: 1, pro: 2 };
    return tierOrder[userProfile.tier] >= tierOrder[requiredTier];
  };
  
  return { canAccessTemplate };
}
```

---

## 📦 Data Architecture

### Type Definitions
```typescript
// All types are in app/lib/types/platform/

// User types
interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
}

// Template types
interface Template {
  id: string;
  name: string;
  githubUrl: string;
  requiredTier: UserTier;
  category: TemplateCategory;
  framework: TemplateFramework;
}

// Project types
interface Project {
  id: string;
  userId: string;
  name: string;
  templateId?: string;
  status: ProjectStatus;
}
```

### Mock Data Structure
```typescript
// app/lib/mock/templates.ts
export const mockTemplates: Template[] = [
  { /* template 1 */ },
  { /* template 2 */ },
  // ... 8 total
];

// Helper functions
export function getFeaturedTemplates() {
  return mockTemplates.filter(t => t.featured);
}

export function getTemplatesByTier(tier: UserTier) {
  return mockTemplates.filter(t => t.requiredTier === tier);
}
```

---

## 🔌 Integration Points

### 1. WebContainer Integration
```typescript
// Original functionality - DO NOT MODIFY
// app/lib/webcontainer/index.ts
export const webcontainer = WebContainer.boot();

// Used by editor stores
export class FilesStore {
  #webcontainer: Promise<WebContainer>;
  // Manages file system in browser
}
```

### 2. Theme Integration
```typescript
// Shared between both modes
// app/lib/stores/theme.ts
export function toggleTheme() {
  const newTheme = current === 'dark' ? 'light' : 'dark';
  themeStore.set(newTheme);
  localStorage.setItem(kTheme, newTheme);
  document.querySelector('html')?.setAttribute('data-theme', newTheme);
}
```

### 3. Future Backend Integration Points
```typescript
// These will need real implementations:

// 1. Template fetching
async function fetchTemplate(githubUrl: string) {
  // Call GitHub API
  // Parse repository
  // Return file structure
}

// 2. Project saving
async function saveProject(project: Project) {
  // Call D1 database
  // Store project data
  // Return success
}

// 3. User authentication
async function login(email: string, password: string) {
  // Call auth API
  // Get JWT token
  // Update auth store
}
```

---

## 🎯 Design Patterns

### 1. Component Composition
```typescript
// Build complex UIs from simple components
<PlatformLayout>
  <Section>
    <Container>
      <Grid>
        <Card>
          <CardHeader />
          <CardContent />
          <CardActions />
        </Card>
      </Grid>
    </Container>
  </Section>
</PlatformLayout>
```

### 2. Custom Hooks
```typescript
// Encapsulate logic
export function useAuth() {
  const auth = useStore(authStore);
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: (email, password) => { /* ... */ },
    logout: () => { /* ... */ },
  };
}
```

### 3. Render Props / Children
```typescript
// Flexible composition
<DataLoader>
  {({ data, loading, error }) => (
    loading ? <Spinner /> : <DataView data={data} />
  )}
</DataLoader>
```

### 4. Lazy Loading
```typescript
// Load components on demand
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

---

## 🔧 Build Architecture

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    remixVitePlugin(),      // Remix support
    UnoCSS(),               // Utility CSS
    tsconfigPaths(),        // Path aliases
    nodePolyfills(),        // Browser polyfills
  ],
});
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "~/*": ["./app/*"] }
  }
}
```

### Build Output
```
build/
├── client/           # Client-side bundle
│   ├── index.html
│   └── assets/
└── server/           # Server-side bundle (Cloudflare)
```

---

## 📈 Performance Considerations

### Code Splitting
- Remix automatically splits by route
- Use dynamic imports for heavy components
- Lazy load animations and effects

### State Management
- Nanostores are lightweight (< 1kb)
- Only re-render components that use changed stores
- Avoid unnecessary store subscriptions

### Styling
- UnoCSS generates minimal CSS
- CSS variables enable theme switching without duplication
- Critical CSS is inlined

### Asset Optimization
- Images are served from `/public`
- SVGs for icons (inline or referenced)
- Lottie animations loaded on demand

---

This architecture reference provides the technical foundation needed to understand how all pieces fit together and make informed development decisions.
