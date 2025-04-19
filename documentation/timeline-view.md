# Linear Timeline View Feature

## Overview

The Linear Timeline View allows users to view and navigate through the document's version history. It provides a read-only timeline view with directional steppers and a seeking bar for version navigation. Document versions are automatically saved locally in the client application memory.

## Requirements

- Read-only timeline view of the current document
- Directional steppers (forward and backward)
- Video playback-style controls
- Single seeking bar showing linear version progression
- Automatic version saving
- ProseMirror collaboration module integration
- Debounced auto-save in the editor

## Implementation Steps

### 1. Version Store Setup

- Create a version store using Zustand
- Store versions with monotonically increasing numbers
- Define proper TypeScript types for Step and Version
- Implement debounced auto-save functionality
- Set up storage structure for version-to-content mapping

### 2. Content Management

- Store document content alongside each version number
- Create methods to save/retrieve content by version
- Handle content serialization/deserialization
- Ensure content persistence across sessions
- Add proper error handling for missing content

### 3. ProseMirror Integration

- Integrate ProseMirror's collaboration module
- Set up Step tracking for document changes
- Ensure proper version incrementing
- Handle Step serialization/deserialization

### 4. Timeline Component Structure

- Create base Timeline component
- Add read-only document viewer
- Implement version navigation controls
- Style the timeline interface

### 5. Timeline Controls

- Add forward/backward steppers
- Implement seeking bar for version navigation
- Add version number display
- Handle version selection logic

### 6. TipTap Editor Updates

- Add auto-save functionality with debounce
- Connect editor to version store
- Ensure proper state management between editor and timeline
- Handle version transitions smoothly

### 7. State Synchronization

- Ensure Timeline and Editor stay in sync
- Handle version loading/switching
- Manage read-only state in Timeline view
- Implement proper error handling

## Technical Notes

- Uses ProseMirror's collaboration module for change tracking
- Each change in the editor is modeled as a single Step
- Version numbers increase monotonically
- Content is stored alongside version numbers for accurate historical viewing
- Auto-save is implemented with debouncing to prevent excessive saves
