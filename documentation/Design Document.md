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

Visual representation of branch relationships using ReactFlow.

**Components:**

- BranchFlow: ReactFlow implementation for branch visualization

  ```typescript
  type VersionNode = {
    id: string;
    type: "versionNode";
    position: { x: number; y: number };
    data: {
      version: Version;
      branchName: string;
      isSelected: boolean;
      onSelect: () => void;
      branchCount: number; // Number of branches from this version
    };
  };

  type BranchEdge = {
    id: string;
    source: string;
    target: string;
    type: "smoothstep"; // Curved lines for better visualization
    sourceHandle: Position;
    targetHandle: Position;
    data: {
      isBranchPoint: boolean;
    };
  };

  type BranchLayout = {
    parentVersionId: string;
    branchCount: number; // Number of branches from this version
    branchIndex: number; // This branch's index among siblings
    level: number; // Branch depth in hierarchy
  };

  type NodePosition = {
    x: number; // Horizontal position (time-based)
    y: number; // Vertical position (branch level)
    level: number; // Branch depth level
    offset: number; // Vertical offset for multiple branches
  };
  ```

**Layout Algorithm:**

```typescript
const calculateNodePosition = (
  versionIndex: number,
  branchLevel: number,
  branchOffset: number,
  spacing: {
    x: number; // Horizontal spacing between versions
    y: number; // Vertical spacing between branches
    branchPadding: number; // Extra padding for multiple branches
  }
) => ({
  x: versionIndex * spacing.x,
  y: branchLevel * spacing.y + branchOffset * spacing.branchPadding,
});
```

**Multi-Branch Handling:**

- Multiple branches can originate from any version node
- Vertical spacing automatically adjusts for:
  - Number of child branches
  - Branch hierarchy depth
  - Sibling branch relationships
- Edge routing optimized for:
  - Clear visual paths
  - Minimal crossing
  - Branch point indication

**Layout Structure:**

- Horizontal timeline layout
- Left-to-right progression for versions
- Downward branching with automatic offsets
- Automatic positioning based on:
  - Version index within branch
  - Branch level in hierarchy
  - Number of sibling branches
  - Parent-child relationships

**Visual Hierarchy:**

- Main branch at top level
- Child branches flow downward with calculated offsets
- Multiple branches from same version are:
  - Evenly spaced
  - Clearly connected
  - Visually distinct
- Clear visual distinction between:
  - Regular version connections
  - Branch point connections
  - Selected versions
  - Current active version
  - Multiple branches from same point

**Branch Point Visualization:**

- Version nodes show branch count indicator
- Visual feedback for potential branch points
- Clear indication of:
  - Source version
  - Branch relationships
  - Sibling branches
  - Branch hierarchy

**Performance Optimizations:**

- Memoized layout calculations
- Efficient node positioning
- Smart edge routing
- Virtualized rendering for large graphs
- Optimized re-renders

**Interaction Model:**

- Click version node to select
- Hover for version details including:
  - Branch count
  - Version metadata
  - Available actions
- Pan and zoom for navigation
- Version nodes show:
  - Version number
  - Timestamp
  - Branch name
  - Selection state
  - Number of child branches

**Implementation Details:**

- Custom node types for versions
- Custom edge types with smart routing
- Automatic layout calculation
- Responsive positioning
- Interactive controls
- Branch relationship tracking
- Sibling branch management

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
