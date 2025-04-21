# VersionStore Documentation

The VersionStore is the core state management system for Cadmus, handling all version control operations and state persistence. It's built using Zustand and implements a Git-like branching model for rich text content.

## Core Concepts

### Versions

A version represents a snapshot of the editor's content at a specific point in time. Each version contains:

- Content (JSON representation of the editor state)
- Steps (changes made since the last version)
- Timestamp
- Branch ID
- Parent version reference

### Branches

A branch is a named line of development. Each branch contains:

- Unique ID
- Name
- Parent branch reference
- Current version ID
- Creation timestamp
- Main branch flag

### Steps

Steps are individual changes made to the content. They are:

- Serialized ProseMirror steps
- Used to track changes between versions
- Associated with a specific version
- Include metadata like client ID

## State Structure

```typescript
type VersionStore = {
  // State
  currentVersion: number;
  steps: Step[];
  lastSaved: Date;
  isDirty: boolean;
  documentState: DocumentState | null;
  versions: Map<number, Version>;
  branches: Map<string, Branch>;
  activeBranchId: string;
  hasContent: boolean;
  isInitialEditing: boolean;
  storageState: StorageState;

  // Operations
  saveVersion: (editorState: EditorState) => void;
  getVersionContent: (version: number) => Result<JSONContent>;
  getVersionRange: (
    fromVersion: number,
    toVersion: number
  ) => Result<Version[]>;
  setCurrentVersion: (version: number) => Result<void>;
  createBranch: (parentVersionId: string) => Result<Branch>;
  switchBranch: (branchId: string) => Result<void>;
  getActiveBranch: () => Branch;
  getBranchVersions: (branchId: string) => Result<BranchVersion[]>;
  applyStep: (step: PMStep) => void;
  setDirty: (isDirty: boolean) => void;
  reset: () => void;
  validateStorage: () => StorageValidationState;
  recoverFromCorruption: () => Result<void>;
};
```

## Key Operations

### Version Management

#### saveVersion

Creates a new version from the current editor state:

```typescript
saveVersion: (editorState: EditorState) => void
```

- Serializes current content
- Creates a new version with current steps
- Updates branch references
- Clears pending steps
- Updates storage

#### getVersionContent

Retrieves content for a specific version:

```typescript
getVersionContent: (version: number) => Result<JSONContent>;
```

- Validates version number
- Returns version content if found
- Handles error cases

### Branch Operations

#### createBranch

Creates a new branch from a parent version:

```typescript
createBranch: (parentVersionId: string) => Result<Branch>;
```

- Validates parent version
- Creates new branch with unique ID
- Sets initial branch state
- Updates storage

#### switchBranch

Switches to a different branch:

```typescript
switchBranch: (branchId: string) => Result<void>;
```

- Validates branch existence
- Updates active branch
- Loads branch content
- Handles error cases

### Step Management

#### applyStep

Records a new change step:

```typescript
applyStep: (step: PMStep) => void
```

- Serializes ProseMirror step
- Adds to pending steps
- Marks content as dirty

## Storage and Persistence

The VersionStore uses localStorage for persistence with the following features:

- Automatic state serialization
- Corruption detection and recovery
- Version validation
- Branch integrity checks

### Storage Format

```typescript
type StoredDocument = {
  versions: Record<number, Version>;
  branches: Record<string, Branch>;
  currentVersion: number;
  activeBranchId: string;
  storageState: StorageValidationState;
};
```

## Error Handling

All operations that can fail return a Result type:

```typescript
type Result<T> = {
  data?: T;
  error?: OperationError;
};
```

Common error scenarios:

- Invalid version numbers
- Missing versions
- Corrupted content
- Invalid branch operations
- Storage corruption

## Usage Examples

### Creating a New Version

```typescript
const { saveVersion } = useVersionStore();

// In editor update handler
const handleUpdate = ({ editor }) => {
  saveVersion(editor.state);
};
```

### Switching Branches

```typescript
const { switchBranch } = useVersionStore();

const handleBranchSwitch = (branchId: string) => {
  const result = switchBranch(branchId);
  if (result.error) {
    // Handle error
  }
};
```

### Getting Version History

```typescript
const { getBranchVersions, activeBranchId } = useVersionStore();

const versions = getBranchVersions(activeBranchId);
if (versions.data) {
  // Render version history
}
```

## Best Practices

1. Always check Result types for errors
2. Use the provided utility functions for version and branch operations
3. Maintain proper error handling and user feedback
4. Validate version and branch IDs before operations
5. Use the storage validation functions when loading content
6. Handle the isInitialEditing state appropriately
7. Keep track of dirty state for unsaved changes
