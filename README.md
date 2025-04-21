# Version Control for Rich Text Editors

This is aversion control system designed specifically for rich text editors, offering Git-like branching capabilities in a user-friendly interface.

## Features

- 📝 Rich text editing with Tiptap
- 🌳 Git-like branching system
- 📚 Version history tracking
- 🔄 Branch switching
- ⏱️ Timeline view for version navigation
- 🌗 Dark mode support
- 🎯 Real-time content updates

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

1. Clone the repository:

```bash
git clone git@github.com:yourusername/Quiz-Assessment-Builder.git

cd Quiz-Assessment-Builde
```

2. Install dependencies:

```bash
pnpm install

```

3. Start the development server:

```bash
pnpm run dev

```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/         # React components
│   ├── timeline/      # Version control UI components
│   └── tiptap/        # Editor components
├── store/             # State management
│   └── versionStore.ts # Version control logic
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── constants.ts       # Application constants
```

## How It Works

It combines the power of Tiptap for rich text editing with a custom version control system. The editor tracks changes and allows users to:

1. Create versions (commits) of their content
2. Create branches for different content variations
3. Switch between versions and branches
4. View the full history of changes
5. Navigate through versions using a timeline interface

The version control system is managed by the VersionStore, which handles:

- Version creation and management
- Branch operations
- Content persistence
- State synchronization

For detailed information for things like the VersionStore, see the[Documentation](./docs).

## Tech Stack

- React
- TypeScript
- Tiptap
- Zustand
- Tailwind CSS
- shadcn/ui
