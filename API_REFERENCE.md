# OtterAI - API Reference for LLMs

**Purpose:** Complete reference of available functions, hooks, components, and utilities

---

## 📚 Table of Contents

1. [Stores API](#stores-api)
2. [Hooks API](#hooks-api)
3. [Component API](#component-api)
4. [Utility Functions](#utility-functions)
5. [Type Definitions](#type-definitions)
6. [Mock Data API](#mock-data-api)

---

## 🗄️ Stores API

### Platform Stores

#### `authStore`
**Location:** `app/lib/stores/platform/auth.ts`

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Usage
import { useStore } from '@nanostores/react';
import { authStore, login, logout } from '~/lib/stores/platform/auth';

const auth = useStore(authStore);

// Actions
login(email: string, password: string): Promise<void>
logout(): void
signup(email: string, password: string, name: string): Promise<void>
```

#### `userProfileStore`
**Location:** `app/lib/stores/platform/user.ts`

```typescript
// Store
const userProfile = useStore(userProfileStore);

// Actions
updateUserProfile(updates: Partial<UserProfile>): void
upgradeTier(newTier: UserTier): void

// Example
updateUserProfile({ name: 'New Name' });
upgradeTier('plus');
```

#### `templatesStore`
**Location:** `app/lib/stores/platform/templates.ts`

```typescript
// Store (array of templates)
const templates = useStore(templatesStore);

// Methods
addTemplate(template: Template): void
updateTemplate(id: string, updates: Partial<Template>): void
deleteTemplate(id: string): void
```

#### `projectsStore`
**Location:** `app/lib/stores/platform/projects.ts`

```typescript
// Store (array of projects)
const projects = useStore(projectsStore);

// Actions
createProject(input: CreateProjectInput): void
updateProject(id: string, updates: Partial<Project>): void
deleteProject(id: string): void
archiveProject(id: string): void
```

### Original Stores (DO NOT MODIFY)

#### `chatStore`
```typescript
// Location: app/lib/stores/chat.ts
const chat = useStore(chatStore);
// Contains: messages, started, aborted, etc.
```

#### `workbenchStore`
```typescript
// Location: app/lib/stores/workbench.ts
// Complex store managing editor, files, terminal, previews
```

#### `themeStore` (SHARED)
```typescript
// Location: app/lib/stores/theme.ts
const theme = useStore(themeStore); // 'light' | 'dark'

// Actions
toggleTheme(): void
themeIsDark(): boolean
```

---

## 🪝 Hooks API

### Platform Hooks

#### `useAuth()`
**Location:** `app/lib/hooks/platform/useAuth.ts`

```typescript
function useAuth() {
  return {
    user: AuthUser | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null,
    login: (email: string, password: string) => Promise<void>,
    logout: () => void,
    signup: (email: string, password: string, name: string) => Promise<void>,
  };
}

// Usage
const { user, isAuthenticated, login } = useAuth();
```

#### `useUser()`
**Location:** `app/lib/hooks/platform/useUser.ts`

```typescript
function useUser() {
  return {
    userProfile: UserProfile | null,
    isAuthenticated: boolean,
    updateProfile: (updates: Partial<UserProfile>) => void,
  };
}

// Usage
const { userProfile, updateProfile } = useUser();
```

#### `useSubscription()`
**Location:** `app/lib/hooks/platform/useSubscription.ts`

```typescript
function useSubscription() {
  return {
    tier: UserTier,
    canAccessTemplate: (requiredTier: UserTier) => boolean,
    canCreateProject: () => boolean,
    upgrade: (newTier: UserTier) => void,
  };
}

// Usage
const { tier, canAccessTemplate } = useSubscription();
if (canAccessTemplate('pro')) {
  // User can access pro templates
}
```

### Original Hooks (DO NOT MODIFY)

#### `useMessageParser()`
```typescript
// Location: app/lib/hooks/useMessageParser.ts
// Parses AI messages and extracts actions
```

#### `usePromptEnhancer()`
```typescript
// Location: app/lib/hooks/usePromptEnhancer.ts
// Enhances user prompts with AI
```

#### `useSnapScroll()`
```typescript
// Location: app/lib/hooks/useSnapScroll.ts
// Manages scroll behavior in chat
```

---

## 🧩 Component API

### Layout Components

#### `<PlatformLayout>`
**Location:** `app/components/platform/layout/PlatformLayout.tsx`

```typescript
interface PlatformLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

// Usage
<PlatformLayout showFooter={true}>
  <YourContent />
</PlatformLayout>
```

#### `<PlatformNav>`
**Location:** `app/components/platform/layout/PlatformNav.tsx`

```typescript
// No props, self-contained
<PlatformNav />
```

#### `<Footer>`
**Location:** `app/components/platform/layout/Footer.tsx`

```typescript
// No props, self-contained
<Footer />
```

### Template Components

#### `<TemplateCard>`
**Location:** `app/components/platform/templates/TemplateCard.tsx`

```typescript
interface TemplateCardProps {
  template: Template;
}

// Usage
<TemplateCard template={template} />
```

#### `<TemplateGrid>`
**Location:** `app/components/platform/templates/TemplateGrid.tsx`

```typescript
interface TemplateGridProps {
  templates: Template[];
  emptyMessage?: string;
}

// Usage
<TemplateGrid 
  templates={filteredTemplates}
  emptyMessage="No templates found"
/>
```

#### `<TemplateFilters>`
**Location:** `app/components/platform/templates/TemplateFilters.tsx`

```typescript
interface TemplateFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: TemplateCategory | undefined) => void;
  onFrameworkChange: (framework: TemplateFramework | undefined) => void;
}

// Usage
<TemplateFilters
  onSearchChange={setSearch}
  onCategoryChange={setCategory}
  onFrameworkChange={setFramework}
/>
```

### Project Components

#### `<ProjectCard>`
**Location:** `app/components/platform/projects/ProjectCard.tsx`

```typescript
interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

// Usage
<ProjectCard 
  project={project}
  onDelete={handleDelete}
/>
```

#### `<ProjectGrid>`
**Location:** `app/components/platform/projects/ProjectGrid.tsx`

```typescript
interface ProjectGridProps {
  projects: Project[];
  onDeleteProject?: (id: string) => void;
  emptyMessage?: string;
}

// Usage
<ProjectGrid
  projects={userProjects}
  onDeleteProject={deleteProject}
/>
```

### Authentication Components

#### `<LoginForm>`
**Location:** `app/components/platform/auth/LoginForm.tsx`

```typescript
// No props, self-contained form
<LoginForm />
```

#### `<SignupForm>`
**Location:** `app/components/platform/auth/SignupForm.tsx`

```typescript
// No props, self-contained form
<SignupForm />
```

#### `<ForgotPasswordForm>`
**Location:** `app/components/platform/auth/ForgotPasswordForm.tsx`

```typescript
// No props, self-contained form
<ForgotPasswordForm />
```

### Pricing Components

#### `<PricingCard>`
**Location:** `app/components/platform/pricing/PricingCard.tsx`

```typescript
interface PricingCardProps {
  tier: UserTier;
  highlighted?: boolean;
}

// Usage
<PricingCard tier="plus" highlighted={true} />
```

#### `<PricingTable>`
**Location:** `app/components/platform/pricing/PricingTable.tsx`

```typescript
interface PricingTableProps {
  highlightTier?: UserTier;
}

// Usage
<PricingTable highlightTier="plus" />
```

### Settings Components

#### `<ProfileForm>`
**Location:** `app/components/platform/settings/ProfileForm.tsx`

```typescript
// No props, uses store internally
<ProfileForm />
```

#### `<BillingPanel>`
**Location:** `app/components/platform/settings/BillingPanel.tsx`

```typescript
// No props, uses store internally
<BillingPanel />
```

#### `<UsageStats>`
**Location:** `app/components/platform/settings/UsageStats.tsx`

```typescript
// No props, uses store internally
<UsageStats />
```

### UI Components

#### `<ThemeToggle>`
**Location:** `app/components/ui/ThemeToggle.tsx`

```typescript
// No props, self-contained
<ThemeToggle />
```

#### `<IconButton>`
**Location:** `app/components/ui/IconButton.tsx`

```typescript
interface IconButtonProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  title?: string;
}

// Usage
<IconButton 
  icon="i-ph:x-circle"
  size="xl"
  onClick={handleClose}
/>
```

### Animation Components

#### `<LottieLoader>`
**Location:** `app/components/platform/LottieLoader.tsx`

```typescript
interface LottieLoaderProps {
  className?: string;
  src: string;
  speed?: number;
}

// Pre-configured components
<BuildAnimationLoader className="w-64 h-64" />
<DeployAnimationLoader className="w-64 h-64" />
```

---

## 🛠️ Utility Functions

### Tier Limits
**Location:** `app/lib/utils/tier-limits.ts`

```typescript
function getTierLimits(tier: UserTier): TierLimits

interface TierLimits {
  name: string;
  price: number;
  priceId: string;
  features: string[];
  limits: {
    projects: number;
    tokensPerMonth: number;
    templatesAccess: 'basic' | 'all' | 'premium';
  };
}

// Usage
const limits = getTierLimits('plus');
console.log(limits.limits.projects); // 50
```

### Class Name Utilities
**Location:** `app/utils/classNames.ts`

```typescript
function classNames(...classes: (string | boolean | undefined)[]): string

// Usage
classNames(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)
// Returns: "base-class active-class" (if isActive=true, isDisabled=false)
```

**Location:** `app/lib/utils/cn.ts`

```typescript
function cn(...inputs: ClassValue[]): string

// Usage (with Tailwind merge)
cn('px-4 py-2', 'px-6') // Returns: "px-6 py-2"
```

### Date Utilities
**Location:** Using `date-fns` package

```typescript
import { formatDistanceToNow } from 'date-fns';

// Usage
formatDistanceToNow(new Date(project.lastModified), { addSuffix: true });
// Returns: "2 days ago"
```

---

## 📘 Type Definitions

### User Types
**Location:** `app/lib/types/platform/user.ts`

```typescript
type UserTier = 'free' | 'plus' | 'pro';
type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  tier: UserTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  stripeCustomerId?: string;
}

interface UserProfile extends User {
  subscription: Subscription;
}
```

### Template Types
**Location:** `app/lib/types/platform/template.ts`

```typescript
type TemplateCategory = 
  | 'frontend' 
  | 'fullstack' 
  | 'backend' 
  | 'mobile' 
  | 'ai' 
  | 'ecommerce' 
  | 'blog' 
  | 'portfolio'
  | 'other';

type TemplateFramework = 
  | 'react' 
  | 'vue' 
  | 'svelte' 
  | 'angular' 
  | 'next' 
  | 'remix' 
  | 'astro' 
  | 'vite'
  | 'node'
  | 'express'
  | 'other';

interface Template {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  githubUrl: string;
  thumbnailUrl?: string;
  category: TemplateCategory;
  tags: string[];
  framework: TemplateFramework;
  requiredTier: UserTier;
  featured: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateFilters {
  category?: TemplateCategory;
  framework?: TemplateFramework;
  tier?: UserTier;
  search?: string;
  tags?: string[];
}
```

### Project Types
**Location:** `app/lib/types/platform/project.ts`

```typescript
type ProjectStatus = 'active' | 'archived' | 'deleted';

interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  templateId?: string;
  templateName?: string;
  status: ProjectStatus;
  lastModified: Date;
  createdAt: Date;
  files?: ProjectFiles;
  previewUrl?: string;
}

interface ProjectFiles {
  [path: string]: {
    content: string;
    type: string;
  };
}

interface CreateProjectInput {
  name: string;
  description?: string;
  templateId?: string;
}
```

### Auth Types
**Location:** `app/lib/types/platform/auth.ts`

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'plus' | 'pro';
  avatar?: string;
}
```

---

## 🎲 Mock Data API

### Templates
**Location:** `app/lib/mock/templates.ts`

```typescript
// All templates (8 total)
export const mockTemplates: Template[]

// Helper functions
export function getFeaturedTemplates(): Template[]
export function getTemplatesByCategory(category: TemplateCategory): Template[]
export function getTemplateById(id: string): Template | undefined

// Usage
import { mockTemplates, getFeaturedTemplates } from '~/lib/mock/templates';
const featured = getFeaturedTemplates(); // Returns featured templates
```

### Users
**Location:** `app/lib/mock/users.ts`

```typescript
// Mock user (for development)
export const mockUser: User

// Mock user profile
export const mockUserProfile: UserProfile

// Usage
import { mockUserProfile } from '~/lib/mock/users';
```

### Projects
**Location:** `app/lib/mock/projects.ts`

```typescript
// Mock projects (5 total)
export const mockProjects: Project[]

// Usage
import { mockProjects } from '~/lib/mock/projects';
```

---

## 🎨 Style Utilities

### CSS Variable Reference

#### Backgrounds
```scss
--build-chat-colors-bg-1  // Lightest (light) / Pure black (dark)
--build-chat-colors-bg-2  // Light / Elevated dark
--build-chat-colors-bg-3  // Main content
--build-chat-colors-bg-4  // Cards/elements

// Utility classes
.bg-bg-1, .bg-bg-2, .bg-bg-3, .bg-bg-4
```

#### Text
```scss
--build-chat-colors-text-primary    // Main text
--build-chat-colors-text-secondary  // Secondary text
--build-chat-colors-text-tertiary   // Tertiary text

// Utility classes
.text-text-primary, .text-text-secondary, .text-text-tertiary
```

#### Borders
```scss
--build-chat-colors-border-primary    // Main borders
--build-chat-colors-border-secondary  // Lighter borders
--build-chat-colors-border-tertiary   // Lightest borders

// Utility classes
.border-border-primary, .border-border-secondary, .border-border-tertiary
```

#### Brand
```scss
--brand-primary: #e86b47         // Orange
--brand-primary-hover: #d45a36   // Darker orange

// Usage
bg-[#e86b47], text-[#e86b47]
```

#### Shadows
```scss
--shadow-soft           // Subtle shadow
--shadow-elevation      // Pronounced shadow
--shadow-dialog         // Modal shadow

// Utility classes
.shadow-soft, .shadow-elevation, .shadow-dialog
```

---

## 🔄 Framer Motion Utilities

### Common Animation Patterns

```typescript
// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Slide up on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

// Animate in viewport
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>

// Hover scale
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.2 }}
>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map((item) => (
    <motion.div variants={itemVariants} key={item.id}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

This API reference provides complete documentation of all available functions, components, and utilities for working with the OtterAI codebase.
