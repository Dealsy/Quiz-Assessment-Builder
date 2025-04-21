import { DocumentState, Step, Version, Branch, BranchVersion } from "./version";
import { EditorState } from "@tiptap/pm/state";
import { JSONContent } from "@tiptap/react";
import { Step as PMStep } from "prosemirror-transform";
import { Result, StorageValidationState } from "./validation";

export type VersionState = {
  currentVersion: number;
  steps: Step[];
  versions: Map<number, Version>;
};

export type BranchState = {
  branches: Map<string, Branch>;
  activeBranchId: string;
};

export type DocumentMetadata = {
  lastSaved: Date;
  isDirty: boolean;
  hasContent: boolean;
  isInitialEditing: boolean;
  documentState: DocumentState | null;
};

export type VersionOperations = {
  saveVersion: (editorState: EditorState) => void;
  getVersionContent: (version: number) => Result<JSONContent>;
  getVersionRange: (
    fromVersion: number,
    toVersion: number
  ) => Result<Version[]>;
  setCurrentVersion: (version: number) => Result<void>;
};

export type BranchOperations = {
  createBranch: (parentVersionId: string) => Result<Branch>;
  switchBranch: (branchId: string) => Result<void>;
  getActiveBranch: () => Branch;
  getBranchVersions: (branchId: string) => Result<BranchVersion[]>;
};

export type StateOperations = {
  applyStep: (step: PMStep) => void;
  setDirty: (isDirty: boolean) => void;
  reset: () => void;
  validateStorage: () => StorageValidationState;
  recoverFromCorruption: () => Result<void>;
};

export type VersionStoreState = VersionState &
  BranchState &
  DocumentMetadata & {
    storageState: StorageValidationState;
  } & VersionOperations &
  BranchOperations &
  StateOperations;
