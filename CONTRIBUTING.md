# Contributing to SendAny

Welcome to SendAny! Thank you for considering contributing to this project. This guide will help you get started and follow best practices.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Process](#development-process)
- [Code Guidelines](#code-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Review Process](#review-process)
- [Resources and Help](#resources-and-help)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for everyone. By participating, you agree to maintain:

- **Respect**: Treat everyone with respect and professionalism
- **Inclusivity**: Be welcoming to contributors of all levels
- **Collaboration**: Work together constructively
- **Focus**: Keep discussions relevant to the project

## 🚀 How Can I Contribute?

### Reporting Bugs

Before reporting a bug:
- Check if a similar issue already exists
- Use the latest version of the project
- Test in a clean environment if possible

**Bug Report Template:**
```markdown
**Bug Description**
Clear and concise description of the problem.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]

**Additional Context**
Any additional information about the problem.
```

### Suggesting Improvements

To suggest a new feature:
- Check if a similar issue doesn't already exist
- Clearly describe the problem the feature would solve
- Explain how you imagine it would work
- Consider alternative implementations

**Feature Request Template:**
```markdown
**Problem/Need**
Clear description of the problem you're trying to solve.

**Proposed Solution**
Clear description of how you'd like it to work.

**Alternatives Considered**
Other solutions you considered.

**Additional Context**
Screenshots, mockups, or any additional information.
```

### Contributing Code

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a branch for your feature (`git checkout -b feature/new-feature`)
4. **Make** your changes
5. **Test** your changes
6. **Commit** your changes (`git commit -am 'Add new feature'`)
7. **Push** to the branch (`git push origin feature/new-feature`)
8. **Open** a Pull Request

## 🛠️ Development Environment Setup

### Prerequisites

- **Node.js 22+** 
- **pnpm** (recommended package manager)
- **Git**
- **Neon Database account** (PostgreSQL)
- **Stack Auth account** or Neon Auth (beta)
- **Google Cloud Console** (for Google Drive integration)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/misterioso013/sendany.git
cd sendany
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Database
DATABASE_URL="postgresql://..."

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=""
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=""
STACK_SECRET_SERVER_KEY=""

# Google Drive Integration
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Cleanup API (optional)
CLEANUP_API_KEY=""
```

4. **Configure the database:**
```bash
# Execute the SQL schema in your Neon console
cat database/schema.sql
```

5. **Configure Stack Auth:**
```bash
npx @stackframe/init-stack . --no-browser
```

6. **Run the project:**
```bash
pnpm dev
```

The project will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── [slug]/            # Workspace viewer
│   ├── api/               # API Routes
│   ├── dashboard/         # User dashboard
│   └── new/               # Workspace creation
├── components/            # React components
│   ├── ui/               # UI components (Shadcn)
│   ├── workspace-editor.tsx
│   ├── workspace-viewer.tsx
│   └── file-uploader.tsx
├── hooks/                # Custom hooks
├── lib/                  # Utilities and configurations
│   ├── databse.ts       # Database functions
│   ├── google-drive.ts  # Google Drive integration
│   └── utils.ts         # General utilities
└── stack.tsx            # Stack Auth configuration
```

### Main Components

- **WorkspaceEditor**: Main editor with sidebar, CodeMirror and settings
- **WorkspaceViewer**: Read-only workspace viewer
- **CodeEditor**: Code editor with syntax highlighting
- **FileUploader**: File upload with drag & drop
- **CreateWorkspaceForm**: Workspace creation form

### Database

- **workspaces**: Workspace information
- **workspace_files**: Files within workspaces  
- **workspace_views**: Basic view analytics

## 💻 Development Process

### Branches

- `main`: Main branch (production)
- `develop`: Development branch
- `feature/`: New features (`feature/new-functionality`)
- `bugfix/`: Bug fixes (`bugfix/fix-upload`)
- `hotfix/`: Urgent fixes (`hotfix/critical-security`)

### Commits

Use the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New functionality
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (doesn't affect logic)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build/config tasks

**Examples:**
```bash
feat(workspace): add support for multiple files
fix(upload): fix Google Drive timeout error
docs(readme): update installation instructions
style(ui): improve button spacing
refactor(auth): simplify authentication logic
test(workspace): add tests for creation
chore(deps): update Next.js to version 15
```

### Pull Requests

**PR Template:**
```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (change that fixes an issue)
- [ ] New feature (change that adds functionality)
- [ ] Breaking change (change that breaks compatibility)
- [ ] Documentation

## How Has This Been Tested?
Describe the tests performed.

## Checklist
- [ ] My code follows project guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code in complex parts
- [ ] I have updated documentation if necessary
- [ ] My changes generate no new warnings
- [ ] I have tested on different browsers/devices
```

## 📝 Code Guidelines

### TypeScript

- Use TypeScript for all `.ts` and `.tsx` files
- Prefer interfaces over types when possible
- Use explicit types in function parameters
- Avoid `any`, use specific types

```typescript
// ✅ Good
interface WorkspaceFile {
  id: string;
  filename: string;
  content?: string;
  file_type: "text" | "code" | "markdown" | "file";
}

// ❌ Avoid
const file: any = { ... };
```

### React/Next.js

- Use functional components with hooks
- Use `"use client"` only when necessary
- Use Server Components by default
- Implement loading and error states

```tsx
// ✅ Server Component
export default async function WorkspacePage() {
  const workspace = await getWorkspace(slug);
  return <WorkspaceViewer workspace={workspace} />;
}

// ✅ Client Component (when necessary)
"use client";
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <div onClick={() => setState(!state)} />;
}
```

### CSS/Styling

- Use Tailwind CSS for styling
- Prefer Shadcn UI components
- Use `cn()` for conditional classes
- Maintain responsiveness (mobile-first)

```tsx
// ✅ Good
import { cn } from "@/lib/utils";

<div className={cn(
  "flex items-center gap-2 p-2",
  isActive && "bg-muted",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />

// ❌ Avoid unnecessary custom CSS
<div style={{ display: 'flex', padding: '8px' }} />
```

### File Structure

- One component per file
- Use descriptive and consistent names
- Export component as default
- Organize imports (external, internal, relative)

```tsx
// ✅ File structure
"use client";

import { useState } from "react"; // External
import { Button } from "@/components/ui/button"; // Internal
import { cn } from "@/lib/utils"; // Utilities

interface ComponentProps {
  // Props interface
}

export default function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

## 🧪 Testing

Currently the project doesn't have automated tests, but we plan to implement:

### Test Plans

- **Unit Tests**: Jest + Testing Library
- **Integration Tests**: Playwright
- **E2E Tests**: Cypress
- **API Tests**: Supertest

### Manual Testing

To test your changes:

1. **Workspace Creation**: Test different file types
2. **File Upload**: Test limits and file types
3. **Authentication**: Test login/logout
4. **Responsiveness**: Test on different screen sizes
5. **Browsers**: Test on Chrome, Firefox, Safari

## 📚 Documentation

### README

Keep README.md updated with:
- Installation instructions
- Usage examples
- Required configurations

### Code Comments

- Comment complex logic
- Explain non-obvious decisions
- Use JSDoc for public functions

```typescript
/**
 * Creates a new workspace with files
 * @param data - Workspace data
 * @param files - Files to upload
 * @returns Promise<Workspace> - Created workspace
 */
export async function createWorkspace(
  data: WorkspaceData,
  files: FileData[]
): Promise<Workspace> {
  // Implementation...
}
```

## 👀 Review Process

### For Reviewers

- Check if code follows guidelines
- Test functionality locally
- Consider performance impact
- Check accessibility
- Consider edge cases

### For Authors

- Respond to comments constructively
- Implement suggestions when appropriate
- Keep PRs small and focused
- Update documentation if necessary

### Approval Criteria

- [ ] Code follows project guidelines
- [ ] Functionality works as expected
- [ ] Doesn't introduce regressions
- [ ] Documentation is updated
- [ ] Tests pass (when implemented)

## 📞 Resources and Help

### Communication

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Discord/Slack**: For real-time communication (if available)

### Technologies

- **Next.js 15**: [Documentation](https://nextjs.org/docs)
- **React 19**: [Documentation](https://react.dev)
- **Tailwind CSS**: [Documentation](https://tailwindcss.com/docs)
- **Shadcn UI**: [Documentation](https://ui.shadcn.com)
- **Stack Auth**: [Documentation](https://docs.stack-auth.com)
- **Neon Database**: [Documentation](https://neon.tech/docs)

### Frequently Asked Questions

**Q: How to configure Google Drive?**  
A: Follow the detailed instructions in README.md "Google Drive Configuration" section

**Q: Can I use other databases besides Neon?**  
A: Currently the project is optimized for PostgreSQL via Neon, but it can work with any PostgreSQL

**Q: How to contribute without technical knowledge?**  
A: You can help with documentation, translation, testing, design or reporting bugs

## 🎉 Recognition

All contributors will be recognized:
- Name in CONTRIBUTORS.md file
- Mention in release notes
- Contributor badge on GitHub profile

---

**Thank you for contributing to SendAny!** 🚀

If you have questions about how to contribute, don't hesitate to open an issue or contact the maintainers.
