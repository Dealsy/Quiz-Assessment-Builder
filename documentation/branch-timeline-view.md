# Branching Timeline View Implementation

## Overview

This document outlines the implementation of the branching timeline feature within the existing Timeline component. The feature will primarily operate within the "Branch View" tab of the Timeline component, utilizing ReactFlow for branch visualization and interaction.

## Core Requirements

1. Create new branches from any version point in the timeline
2. Edit content at any branch's HEAD
3. Navigate through branches and versions using a Git-like interface
4. Visualize branch relationships using ReactFlow

## Implementation Steps

### 1. Type System Updates

1. Add new types in `src/types/version.ts`:

   ```typescript
   type Branch = {
     id: string;
     name: string;
     parentBranchId: string | null;
     parentVersionId: string;
     currentVersionId: string;
     createdAt: Date;
     isMain: boolean;
   };

   type BranchVersion = Version & {
     branchId: string;
     parentVersion: string | null;
   };
   ```

2. Update existing types:
   ```typescript
   type VersionStore = {
     // ... existing fields ...
     branches: Map<string, Branch>;
     activeBranchId: string;
     // ... new methods for branch management ...
   };
   ```

### 2. Version Store Enhancement

1. Extend `versionStore.ts` with branch management:

   ```typescript
   interface BranchOperations {
     createBranch: (parentVersionId: string) => Result<Branch>;
     switchBranch: (branchId: string) => Result<void>;
     getBranchVersions: (branchId: string) => Result<BranchVersion[]>;
     getActiveBranch: () => Branch;
   }
   ```

2. Update version saving logic:

   - Modify `saveVersion` to associate versions with branches
   - Track parent-child relationships between versions
   - Handle version numbering within branches

3. Add branch validation:
   - Validate branch creation points
   - Ensure version integrity across branches
   - Handle branch switching edge cases

### 3. Branch View Component

1. Create new components in `src/components/timeline/branch/`:

   ```typescript
   // BranchView.tsx
   export default function BranchView({
     onBranchCreate: (parentVersionId: string) => void;
     onBranchSwitch: (branchId: string) => void;
     onVersionSelect: (versionId: string) => void;
   });

   // BranchNode.tsx
   type BranchNodeProps = {
     version: BranchVersion;
     isHead: boolean;
     isSelected: boolean;
     onSelect: () => void;
   };

   // BranchEdge.tsx
   type BranchEdgeProps = {
     source: string;
     target: string;
     isBranchPoint: boolean;
   };
   ```

2. Implement ReactFlow integration:
   - Custom node types for versions
   - Custom edge types for branch connections
   - Node positioning algorithm for branch layout
   - Zoom and pan controls

### 4. Branch View UI Elements

1. Add branch management controls:

   ```typescript
   // BranchControls.tsx
   type BranchControlsProps = {
     branches: Branch[];
     activeBranchId: string;
     onBranchSwitch: (branchId: string) => void;
     onBranchCreate: (parentVersionId: string) => void;
   };
   ```

2. Create version node visualization:

   - Show version number and timestamp
   - Indicate branch points
   - Display HEAD markers
   - Show active version

3. Implement branch creation UI:
   - Click version node to show branch creation option
   - Auto-generate branch names
   - Handle branch creation errors

### 5. Timeline Component Updates

1. Modify `Timeline.tsx`:

   - Update tab structure to handle branch view
   - Add branch-aware version navigation
   - Handle branch switching
   - Manage active version across branches

2. Add branch-aware slider:
   - Show branch points on slider
   - Handle version navigation within branches
   - Update version display for current branch

### 6. State Management

1. Update local storage schema:

   ```typescript
   type StoredState = {
     versions: Map<number, BranchVersion>;
     branches: Map<string, Branch>;
     activeBranchId: string;
     lastSaved: Date;
   };
   ```

2. Add branch state persistence:
   - Store branch relationships
   - Maintain version-to-branch mappings
   - Handle storage validation
   - Implement recovery mechanisms

### 7. Editor Integration

1. Update editor state management:

   - Track active branch
   - Handle branch switching
   - Manage version loading
   - Update HEAD references

2. Modify version saving:
   - Save to correct branch
   - Update branch HEAD
   - Handle version conflicts

## Technical Considerations

### Performance

- Lazy load branch data
- Cache branch content
- Optimize ReactFlow rendering
- Minimize state updates

### User Experience

- Smooth branch transitions
- Clear visual hierarchy
- Intuitive branch creation
- Responsive graph layout

### Data Integrity

- Validate branch operations
- Ensure version consistency
- Handle storage corruption
- Prevent invalid states

## Implementation Order

1. Type system updates
2. Version store enhancement
3. Basic branch view with ReactFlow
4. Branch creation and switching
5. Version navigation
6. State persistence
7. UI polish and optimization

## Future Enhancements

- Branch merging
- Branch comparison view
- Branch archiving
- Branch search/filter
- Branch metadata
