# Contributing to Rung Card Game

Thank you for your interest in contributing to the Rung Card Game! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)

---

## Code of Conduct

By participating in this project, you agree to maintain a welcoming and inclusive environment. Please:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility for your mistakes and learn from them

---

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/card-game.git
   cd card-game
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/adeelibr/card-game.git
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```

---

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Title**: A clear, descriptive title
- **Description**: Steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: Browser, OS, and Node.js version
- **Screenshots**: If applicable

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

- **Title**: A clear description of the feature
- **Problem**: What problem does this feature solve?
- **Solution**: Your proposed solution
- **Alternatives**: Any alternative solutions you considered

### Submitting Pull Requests

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Test your changes**:
   ```bash
   pnpm lint
   pnpm build
   ```

4. **Commit your changes** following our [commit guidelines](#commit-guidelines)

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub with:
   - A clear title and description
   - Reference to any related issues
   - Screenshots for UI changes

---

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm package manager

### Running Locally

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting
pnpm lint

# Build for production
pnpm build
```

### Project Structure

```
card-game/
├── app/                  # Next.js pages and routes
├── components/           # React components
│   ├── ui/               # Reusable UI components
│   └── *.tsx             # Feature components
├── lib/                  # Utility functions and game logic
├── hooks/                # Custom React hooks
└── styles/               # Global styles
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type

### React

- Use functional components with hooks
- Follow the component naming convention (PascalCase)
- Keep components small and focused

### Styling

- Use Tailwind CSS for styling
- Follow the existing design patterns
- Ensure responsive design for all screen sizes

### File Naming

- React components: `PascalCase.tsx` (e.g., `GameBoard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `game-logic.ts`)
- Hooks: `use-camelCase.ts` (e.g., `use-game-state.ts`)

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(game): add card animation effects
fix(lobby): resolve player join race condition
docs(readme): update installation instructions
style(components): format code with prettier
```

---

## Questions?

If you have any questions, feel free to:

- Open a [GitHub Discussion](https://github.com/adeelibr/card-game/discussions)
- Create an [Issue](https://github.com/adeelibr/card-game/issues)

Thank you for contributing! 🎴
