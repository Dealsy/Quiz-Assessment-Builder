# Quiz Assessment Builder - Design Document

## Overview

This document outlines the technical design and implementation details for a Quiz Assessment Builder Single Page Application (SPA), with a specific focus on the branching timeline feature.

## Tech Stack

### Core Technologies (Required)

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TipTap (Rich Text Editor)

### Suggested Additional Libraries

- ReactFlow (Branch visualization)
- Zustand (State Management)
- date-fns (Date Manipulation)
- Zod (Runtime Type Validation)

## Project Structure

```
src/
├── assets/                    # Static assets
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   ├── timeline/             # Timeline specific components
│   │   ├── TimelineView.tsx
│   │   ├── VersionSlider.tsx
│   │   └── ...
│   └── branch/               # Branch specific components
│       ├── BranchView.tsx
│       ├── BranchNode.tsx
│       └── ...
├── hooks/                    # Custom React hooks
│   ├── useBranch.ts
│   ├── useVersion.ts
│   └── ...
├── store/                    # State management
│   ├── branchStore.ts
│   ├── editorStore.ts
│   └── ...
├── types/                    # TypeScript type definitions
│   ├── branch.ts
│   ├── version.ts
│   └── ...
├── utils/                    # Utility functions
│   ├── branchUtils.ts
│   ├── versionUtils.ts
│   └── ...
├── lib/                      # Shared utilities and configurations
│   ├── utils.ts
│   └── constants.ts
└── App.tsx                  # Root component
```

## Core Data Structures

### Branch

```typescript
type Branch = {
  id: string;
  name: string; // "Branch 1", "Branch 2", etc.
  createdAt: Date;
  parentBranchId: string | null;
  parentVersionId: string;
  currentVersionId: string;
  isMain: boolean;
};
```

### Version

```typescript
type Version = {
  id: string;
  branchId: string;
  versionNumber: number; // Monotonically increasing
  timestamp: Date;
  steps: Step[];
  metadata: {
    createdBy: string;
    description?: string;
    wordCount?: number;
  };
};

type Step = {
  id: string;
  stepType: "insert" | "delete" | "replace" | "style";
  from: number;
  to: number;
  slice?: {
    content: unknown;
    openStart: number;
    openEnd: number;
  };
  marks?: unknown[];
  structure?: boolean;
  timestamp: Date;
};

type DocumentState = {
  version: number;
  doc: unknown; // ProseMirror document
  steps: Step[];
  lastSaved: Date;
  selection?: {
    anchor: number;
    head: number;
    type: "text" | "node";
  };
};
```

### QuizContent

```typescript
type QuizContent = {
  title: string;
  description: string;
  questions: Question[];
  settings: QuizSettings;
  lastModified: Date;
};
```

## Main Views

### Initial Editor View

Primary entry point for new users creating their first document.

**Components:**

- RichTextEditor: TipTap implementation
- EditorToolbar: Formatting controls
- SaveButton: Creates first version
- InitialSetup: Automatically creates main branch and first version
- StatusIndicator: Shows save status and version info

**Behaviour:**

- Automatically creates "Main Branch" on first save
- No branch selection needed for first document
- Saves become versions on the main branch
- Branch creation option becomes available after first save

### Timeline View

Primary view for browsing document versions and creating branches.

**Components:**

- VersionSlider: Navigate through versions
- BranchSelector: Dropdown to switch branches
- DocumentPreview: Read-only view of selected version
- VersionInfo: Displays metadata (version number, word count)
- CreateBranchButton: Initiates new branch creation
- StepIndicator: Shows individual changes within a version

**Version Control Implementation:**
Using ProseMirror's collaboration module for efficient version control:

- Each change in the editor creates a Step
- Steps are atomic operations (insert, delete, replace, style)
- Versions contain arrays of Steps for efficient storage
- Version numbers increase monotonically
- Steps allow precise reconstruction of any version state

**Version Control Features:**

- Automatic step-by-step change tracking
- Efficient storage using incremental changes
- Granular version history
- Easy branch point creation
- Built-in support for future collaborative features
- Precise reconstruction of any version state

**Timeline Visualization:**

- Shows versions as major points on the timeline
- Expandable to show individual steps within versions
- Visual indicators for significant changes
- Clear marking of branch points
- Interactive navigation through document history

### Branch View

Visual representation of branch relationships.

**Components:**

- BranchFlow: ReactFlow implementation
- BranchNode: Individual branch representation
- BranchConnector: Visual connection between nodes
- BranchControls: Zoom, centre, etc.

### Editor View

Full editing interface for the active branch/version.

**Components:**

- RichTextEditor: TipTap implementation
- EditorToolbar: Formatting controls
- SaveButton: Version creation
- BranchIndicator: Shows current branch/version

## State Management

### Branch Store

```typescript
interface BranchStore {
  branches: Branch[];
  activeBranchId: string;
  activeVersionId: string;
  createBranch: (parentVersionId: string) => void;
  switchBranch: (branchId: string) => void;
  switchVersion: (versionId: string) => void;
}
```

### Editor Store

```typescript
interface EditorStore {
  currentState: DocumentState;
  steps: Step[];
  version: number;
  isDirty: boolean;
  applyStep: (step: Step) => void;
  saveVersion: () => void;
  revertToVersion: (versionId: string) => void;
  getVersionContent: (versionId: string) => DocumentState;
}
```

## Key Workflows

### Initial Document Creation

1. User opens application for the first time
2. Presented with clean editor interface
3. Creates first document content
4. On first save:
   - System creates "Main Branch"
   - Generates first version
   - Enables timeline and branch features
   - Shows success confirmation

### Branch Creation

1. User selects version in Timeline View
2. Clicks "Create Branch"
3. System:
   - Generates next branch name
   - Creates branch record
   - Copies selected version content
   - Switches to Editor View

### Version Navigation

1. User selects branch from dropdown
2. Uses version slider to navigate
3. System:
   - Updates view to selected version
   - Shows read-only content
   - Enables branch creation from this point

### Content Editing

1. User enters Editor View
2. Makes content changes
3. Saves new version:
   - Creates version record
   - Updates branch currentVersionId
   - Returns to Timeline View

## Performance Considerations

- Lazy loading of branch visualization
- Debounced version saving
- Cached version content
- Optimized branch switching

## Future Considerations

- Branch merging functionality
- Version comparison view
- Branch archiving
- Export/import functionality
- Collaborative editing
- Version tagging/labelling

## Security Considerations

- Input sanitization
- Content validation
- Data integrity checks

## Testing Strategy

- Unit tests for utility functions
- Component tests for UI elements
- Integration tests for workflows
- E2E tests for critical paths
