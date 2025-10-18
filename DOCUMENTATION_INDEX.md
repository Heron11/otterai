# OtterAI Documentation Index

**Welcome to the OtterAI codebase documentation suite.**

This documentation is specifically designed to help LLMs understand and work effectively with this codebase. Each document serves a specific purpose and can be read independently or as part of the complete documentation set.

---

## 📚 Documentation Suite

### 1. **LLM_CODEBASE_DOCUMENTATION.md** 
**Primary comprehensive guide for LLMs**

**When to use:** 
- First time working with this codebase
- Need complete understanding of architecture
- Planning major features or refactoring
- Understanding design patterns and conventions

**Contains:**
- Complete project overview and architecture
- File structure and organization
- Key technical patterns (state management, routing, styling)
- Design system specifications
- Integration points and data flow
- Important rules and guidelines
- Common tasks and debugging

**Read this first if:** You're new to the codebase or need comprehensive context.

---

### 2. **QUICK_START_GUIDE.md**
**Fast reference for immediate productivity**

**When to use:**
- Need to start working quickly
- Looking for specific task templates
- Quick reference for common patterns
- Troubleshooting common issues

**Contains:**
- One-minute overview
- Key directories map
- Common task templates (add page, component, state, etc.)
- Styling patterns and examples
- Quick commands
- Critical rules (do's and don'ts)
- Common issues and solutions

**Read this first if:** You need to be productive immediately with minimal reading.

---

### 3. **ARCHITECTURE_REFERENCE.md**
**Deep technical reference for system design**

**When to use:**
- Understanding system architecture
- Planning integration work
- Debugging complex issues
- Making architectural decisions

**Contains:**
- System architecture diagrams
- Request/data flow patterns
- State management architecture
- Styling architecture (CSS variables, layers)
- Component hierarchy
- Routing architecture
- Authentication/authorization patterns
- Build architecture and configuration

**Read this first if:** You need to understand how the system works at a technical level.

---

### 4. **API_REFERENCE.md**
**Complete API documentation**

**When to use:**
- Looking up specific function signatures
- Understanding available hooks and stores
- Component prop interfaces
- Type definitions
- Utility function usage

**Contains:**
- Complete stores API
- All hooks with signatures
- Component API with props
- Utility functions
- Type definitions
- Mock data API
- Style utilities
- Framer Motion patterns

**Read this first if:** You need to look up specific APIs, function signatures, or interfaces.

---

## 🎯 Quick Navigation Guide

### By Task Type

**Adding New Features:**
1. Read: LLM_CODEBASE_DOCUMENTATION.md (sections on patterns)
2. Reference: QUICK_START_GUIDE.md (task templates)
3. Check: API_REFERENCE.md (available APIs)

**Fixing Bugs:**
1. Read: QUICK_START_GUIDE.md (common issues)
2. Reference: ARCHITECTURE_REFERENCE.md (data flow)
3. Check: API_REFERENCE.md (correct usage)

**Understanding Codebase:**
1. Read: LLM_CODEBASE_DOCUMENTATION.md (complete overview)
2. Then: ARCHITECTURE_REFERENCE.md (deep dive)
3. Reference: API_REFERENCE.md (as needed)

**Making Quick Changes:**
1. Read: QUICK_START_GUIDE.md (patterns and rules)
2. Reference: API_REFERENCE.md (APIs)
3. Check: LLM_CODEBASE_DOCUMENTATION.md (if uncertain)

---

## 📋 Documentation Conventions

### Code Examples
All code examples in the documentation use TypeScript and follow the project's conventions:

```typescript
// Imports
import { useStore } from '@nanostores/react';
import type { User } from '~/lib/types/platform/user';

// Component definition
export function MyComponent() {
  const user = useStore(userStore);
  return <div>{user?.name}</div>;
}
```

### File Paths
All file paths are relative to the `otterai/` directory:
- `app/routes/dashboard.tsx` → `/Users/heron/Desktop/otter2/otterai/app/routes/dashboard.tsx`
- Use `~/` for imports (e.g., `import { User } from '~/lib/types/platform/user'`)

### Code Sections
- ✅ **Safe to modify:** New platform features
- ⚠️ **Do not modify:** Original Bolt.new functionality
- 🔄 **Shared:** Used by both modes (modify carefully)

---

## 🔍 Key Concepts Across Documentation

### Dual-Mode Architecture
The application operates in two modes:
1. **Editor Mode (`/`)** - Original Bolt.new functionality (do not modify)
2. **Platform Mode (`/home`, etc.)** - New SaaS features (safe to modify)

### State Management
- Uses **Nanostores** for all reactive state
- Separate stores for platform vs. original functionality
- Mock data for development (no real backend yet)

### Styling System
- **CSS Variables** for colors and theming
- **UnoCSS** for utility classes
- **Custom SCSS** for complex styles
- **Dark/Light themes** fully supported

### Component Patterns
- **PlatformLayout** wrapper for platform pages
- **Nanostores hooks** for state (`useStore`)
- **TypeScript strict mode** for all code
- **Framer Motion** for animations

---

## 📊 Documentation Statistics

- **Total Documentation Files:** 4
- **Total Lines:** ~2,500+
- **Topics Covered:** 50+
- **Code Examples:** 100+
- **Component APIs:** 30+
- **Type Definitions:** 20+

---

## 🚀 Getting Started Workflow

### For First-Time LLMs

**Step 1:** Read the Quick Start Guide (5 minutes)
- File: `QUICK_START_GUIDE.md`
- Focus: Overview, Key Directories, Critical Rules

**Step 2:** Scan the LLM Codebase Documentation (10 minutes)
- File: `LLM_CODEBASE_DOCUMENTATION.md`
- Focus: Architecture, Patterns, Integration Points

**Step 3:** Reference APIs as needed
- File: `API_REFERENCE.md`
- Use: Look up specific functions/components

**Step 4:** Deep dive when needed
- File: `ARCHITECTURE_REFERENCE.md`
- Use: Understand complex flows

**Total Time:** ~15 minutes to become productive

### For Experienced LLMs

**Quick Reference:**
- Task templates → QUICK_START_GUIDE.md
- API lookups → API_REFERENCE.md
- Architecture questions → ARCHITECTURE_REFERENCE.md

---

## 🎓 Best Practices for Using This Documentation

### 1. Start with the Right Document
- **New to codebase?** → LLM_CODEBASE_DOCUMENTATION.md
- **Quick task?** → QUICK_START_GUIDE.md
- **API lookup?** → API_REFERENCE.md
- **Architecture question?** → ARCHITECTURE_REFERENCE.md

### 2. Cross-Reference When Needed
- Quick Start mentions a pattern → Find details in Codebase Documentation
- API Reference shows function → Find usage example in Quick Start
- Architecture shows flow → Find implementation in API Reference

### 3. Verify with Code
- Documentation is accurate as of creation date
- Always verify critical details by reading actual code
- Use documentation as guide, code as truth

### 4. Update Documentation
- If you find errors, note them
- If patterns change, documentation should update
- Keep documentation in sync with code

---

## 📝 Documentation Maintenance

### Last Updated
- **Date:** January 2025
- **Version:** 1.0
- **Status:** Current and accurate

### Update Checklist
When making significant code changes, consider updating:
- [ ] Type definitions in API_REFERENCE.md
- [ ] Component APIs if props change
- [ ] Architecture diagrams if flow changes
- [ ] Quick Start examples if patterns change
- [ ] File structure if directories added/removed

---

## 🔗 Additional Resources

### Project Files
- `README.md` - Project overview and setup
- `CONTRIBUTING.md` - Contribution guidelines
- `package.json` - Dependencies and scripts

### External Documentation
- [Remix Documentation](https://remix.run/docs)
- [Nanostores](https://github.com/nanostores/nanostores)
- [UnoCSS](https://unocss.dev/)
- [Framer Motion](https://www.framer.com/motion/)

---

## 💡 Tips for Maximum Productivity

1. **Bookmark commonly used sections** - Keep API Reference and Quick Start handy
2. **Use documentation search** - Most editors support file search (Cmd/Ctrl+F)
3. **Read code alongside docs** - Documentation explains why, code shows how
4. **Follow the patterns** - Consistency is key in this codebase
5. **Don't modify original code** - Platform features only, keep editor intact

---

## 🆘 Getting Help

### Documentation Questions
- Check the specific document's table of contents
- Use Cmd/Ctrl+F to search within documents
- Cross-reference between documents

### Code Questions
- Start with QUICK_START_GUIDE.md for common issues
- Check API_REFERENCE.md for correct usage
- Review ARCHITECTURE_REFERENCE.md for system understanding

### Still Stuck?
- Read the actual source code
- Check TypeScript errors (`pnpm typecheck`)
- Review existing similar code for patterns

---

This documentation suite is designed to make you productive quickly while providing depth when needed. Start with what you need, dive deeper as required, and always feel free to reference the actual code for ground truth.

Happy coding! 🚀
