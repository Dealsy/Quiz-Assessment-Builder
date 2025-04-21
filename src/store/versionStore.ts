import { create } from "zustand";
import { persist, PersistOptions, StorageValue } from "zustand/middleware";
import { EditorState } from "@tiptap/pm/state";
import { Step as PMStep } from "prosemirror-transform";
import {
  INITIAL_VERSION,
  Version,
  Branch,
  BranchVersion,
  OperationError,
  serializeStep,
} from "../types/version";
import { StorageValidationState } from "../types/validation";
import { VersionStoreState } from "../types/store";
import { debounce } from "../utils/debounce";
import { BRANCH, ERROR_CODE, ERROR_MESSAGE, VERSION } from "@/constants";
import { generateId } from "@/utils/id";
import { isValidVersion, isValidBranch } from "@/utils/version";

const STORAGE_KEY = VERSION.STORAGE_KEY;
const SAVE_DEBOUNCE_MS = VERSION.SAVE_DEBOUNCE_MS;
const MAIN_BRANCH_ID = BRANCH.ID;

const validateBranch = (
  branchId: string,
  branches: Map<string, Branch>
): OperationError | undefined => {
  if (!branches.has(branchId)) {
    return {
      code: ERROR_CODE.BRANCH_NOT_FOUND,
      message: ERROR_MESSAGE.BRANCH_NOT_FOUND(branchId),
    };
  }
  const branch = branches.get(branchId);
  if (!isValidBranch(branch)) {
    return {
      code: ERROR_CODE.INVALID_BRANCH,
      message: ERROR_MESSAGE.INVALID_BRANCH(branchId),
    };
  }
};

const validateStorage = (
  versions: Map<number, Version>,
  branches: Map<string, Branch>
): StorageValidationState => {
  let lastValidVersion = INITIAL_VERSION;
  let isValid = true;

  // Validate versions
  for (const [versionNum, version] of versions.entries()) {
    if (!isValidVersion(version)) {
      isValid = false;
      break;
    }
    lastValidVersion = versionNum;
  }

  // Validate branches
  if (isValid) {
    for (const branch of branches.values()) {
      if (!isValidBranch(branch)) {
        isValid = false;
        break;
      }
    }
  }

  return {
    isStorageValid: isValid,
    lastValidVersion,
  };
};

const validateVersion = (
  version: number,
  versions: Map<number, Version>
): OperationError | undefined => {
  if (version < INITIAL_VERSION) {
    return {
      code: ERROR_CODE.INVALID_VERSION,
      message: ERROR_MESSAGE.VERSION_INVALID(version),
    };
  }
  if (!versions.has(version)) {
    return {
      code: ERROR_CODE.VERSION_NOT_FOUND,
      message: ERROR_MESSAGE.VERSION_NOT_FOUND(version),
    };
  }
};

const saveVersion = (
  editorState: EditorState,
  get: () => VersionStoreState,
  set: (state: Partial<VersionStoreState>) => void
) => {
  const { currentVersion, steps, versions, activeBranchId, branches } = get();
  const isFirstSave = versions.size === 0;
  const newVersion = isFirstSave ? INITIAL_VERSION : currentVersion + 1;
  const now = new Date();

  const version: Version = {
    steps,
    content: editorState.doc.toJSON(),
    timestamp: now.toISOString(),
    branchId: activeBranchId,
    parentVersion: currentVersion.toString(),
  };

  const newVersions = new Map(versions);
  newVersions.set(newVersion, version);

  // Initialize main branch if it doesn't exist
  const newBranches = new Map(branches);
  if (isFirstSave || !newBranches.has(MAIN_BRANCH_ID)) {
    newBranches.set(MAIN_BRANCH_ID, {
      id: MAIN_BRANCH_ID,
      name: "Main",
      parentBranchId: null,
      parentVersionId: INITIAL_VERSION.toString(),
      currentVersionId: newVersion.toString(),
      createdAt: now.toISOString(),
      isMain: true,
    });
  }

  // Update branch's current version
  const activeBranch = newBranches.get(activeBranchId);
  if (activeBranch) {
    newBranches.set(activeBranchId, {
      ...activeBranch,
      currentVersionId: newVersion.toString(),
    });
  }

  // Set all state updates atomically
  set({
    currentVersion: newVersion,
    versions: newVersions,
    branches: newBranches,
    lastSaved: now,
    isDirty: false,
    steps: [],
    // Update these flags immediately on first save
    ...(isFirstSave && {
      hasContent: true,
      isInitialEditing: false,
    }),
  });
};

const persistOptions: PersistOptions<VersionStoreState> = {
  name: STORAGE_KEY,
  storage: {
    getItem: (name): StorageValue<VersionStoreState> | null => {
      const str = localStorage.getItem(name);
      if (!str) return null;

      try {
        const state = JSON.parse(str);
        const versions = new Map(state.versions || []);
        const branches = new Map(state.branches || []);

        // Ensure main branch exists
        if (!branches.has(MAIN_BRANCH_ID)) {
          branches.set(MAIN_BRANCH_ID, {
            id: MAIN_BRANCH_ID,
            name: "Main",
            parentBranchId: null,
            parentVersionId: "1",
            currentVersionId: "1",
            createdAt: new Date().toISOString(),
            isMain: true,
          });
        }

        return {
          state: {
            ...state,
            versions,
            branches,
            lastSaved: new Date(state.lastSaved),
            hasContent: versions.size > 0,
            isInitialEditing: versions.size === 0,
          },
          version: state.version,
        };
      } catch (error) {
        console.error("Error parsing version store:", error);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        const state = value.state;
        const versions = Array.from(state.versions.entries());
        const branches = Array.from(state.branches.entries());

        // Ensure main branch exists
        if (!state.branches.has(MAIN_BRANCH_ID)) {
          branches.push([
            MAIN_BRANCH_ID,
            {
              id: MAIN_BRANCH_ID,
              name: "Main",
              parentBranchId: null,
              parentVersionId: "1",
              currentVersionId: state.currentVersion.toString(),
              createdAt: new Date().toISOString(),
              isMain: true,
            },
          ]);
        }

        localStorage.setItem(
          name,
          JSON.stringify({
            ...state,
            versions,
            branches,
          })
        );
      } catch (error) {
        console.error("Error saving version store:", error);
      }
    },
    removeItem: (name) => localStorage.removeItem(name),
  },
  version: 1,
  onRehydrateStorage: () => (state: VersionStoreState | undefined) => {
    if (!state) return;

    // Initialize storage state
    const storageState = validateStorage(state.versions, state.branches);
    state.storageState = storageState;

    // Update hasContent and isInitialEditing based on versions
    state.hasContent = state.versions.size > 0;
    state.isInitialEditing = state.versions.size === 0;

    if (!storageState.isStorageValid) {
      const result = state.recoverFromCorruption();
      if (result.error) {
        console.error("Error recovering from corruption:", result.error);
      }
    }
  },
};

export const useVersionStore = create<VersionStoreState>()(
  persist((set, get) => {
    const debouncedSave = debounce<EditorState>((editorState) => {
      saveVersion(editorState, get, set);
      set({ isInitialEditing: false });
    }, SAVE_DEBOUNCE_MS);

    return {
      currentVersion: INITIAL_VERSION,
      steps: [],
      lastSaved: new Date(),
      isDirty: false,
      documentState: null,
      versions: new Map(),
      branches: new Map(),
      activeBranchId: MAIN_BRANCH_ID,
      hasContent: false,
      isInitialEditing: true,
      storageState: {
        isStorageValid: true,
        lastValidVersion: INITIAL_VERSION,
      },

      createBranch: (parentVersionId: string) => {
        const { versions, branches, activeBranchId } = get();
        const parentVersion = versions.get(Number(parentVersionId));

        if (!parentVersion) {
          return {
            error: {
              code: ERROR_CODE.INVALID_OPERATION,
              message: ERROR_MESSAGE.INVALID_OPERATION,
            },
          };
        }

        // Use the currently active branch as the parent branch
        const parentBranch = branches.get(activeBranchId);

        if (!parentBranch) {
          return {
            error: {
              code: ERROR_CODE.INVALID_OPERATION,
              message: ERROR_MESSAGE.INVALID_OPERATION,
            },
          };
        }

        // Count existing non-main branches for naming
        const branchCount = Array.from(branches.values()).filter(
          (b) => !b.isMain
        ).length;
        const branchId = generateId();
        const branch: Branch = {
          id: branchId,
          name: `Branch ${branchCount + 1}`,
          parentBranchId: activeBranchId,
          parentVersionId,
          currentVersionId: parentVersionId,
          createdAt: new Date().toISOString(),
          isMain: false,
        };

        const newBranches = new Map(branches);
        newBranches.set(branchId, branch);

        // Update state with new branch and make it active
        set((state) => ({
          ...state,
          branches: newBranches,
          activeBranchId: branchId,
          currentVersion: Number(parentVersionId),
          isDirty: false,
          steps: [],
        }));

        return { data: branch };
      },

      switchBranch: (branchId: string) => {
        const { branches, versions } = get();

        // Validate branch ID
        if (!branchId) {
          return {
            error: {
              code: ERROR_CODE.INVALID_BRANCH,
              message: ERROR_MESSAGE.INVALID_BRANCH(branchId),
            },
          };
        }

        // Validate branch exists
        const branchError = validateBranch(branchId, branches);
        if (branchError) {
          return { error: branchError };
        }

        const branch = branches.get(branchId)!;
        const targetVersion = Number(branch.currentVersionId);
        const version = versions.get(targetVersion);

        if (!version) {
          return {
            error: {
              code: ERROR_CODE.INVALID_OPERATION,
              message: ERROR_MESSAGE.INVALID_OPERATION,
            },
          };
        }

        // Update state with new branch and version
        set((state) => ({
          ...state,
          activeBranchId: branchId,
          currentVersion: targetVersion,
          isDirty: false,
          steps: [],
        }));

        return {};
      },

      getActiveBranch: () => {
        const { branches, activeBranchId } = get();
        return branches.get(activeBranchId)!;
      },

      getBranchVersions: (branchId: string) => {
        const { versions, branches } = get();
        const branchError = validateBranch(branchId, branches);

        if (branchError) {
          return { error: branchError };
        }

        const branch = branches.get(branchId)!;
        const branchVersions: BranchVersion[] = [];
        const seenVersions = new Set<number>();

        // Helper to get branch versions up to a specific version
        const getBranchVersionsUpTo = (
          currentBranch: Branch,
          maxVersionId: string
        ) => {
          for (const [versionNum, version] of versions) {
            if (
              version.branchId === currentBranch.id &&
              versionNum <= Number(maxVersionId) &&
              !seenVersions.has(versionNum)
            ) {
              branchVersions.push({
                version,
                branch: currentBranch,
                isHead:
                  version.parentVersion === currentBranch.currentVersionId,
              });
              seenVersions.add(versionNum);
            }
          }
        };

        // Get versions from parent branches up to the branch point
        let currentBranch = branch;
        while (currentBranch.parentBranchId) {
          const parentBranch = branches.get(currentBranch.parentBranchId);
          if (!parentBranch) break;

          getBranchVersionsUpTo(parentBranch, currentBranch.parentVersionId);
          currentBranch = parentBranch;
        }

        // Get versions from current branch
        getBranchVersionsUpTo(branch, branch.currentVersionId);

        // Sort versions by their version number
        branchVersions.sort((a, b) => {
          const aVersion = Number(a.version.parentVersion || 0);
          const bVersion = Number(b.version.parentVersion || 0);
          return aVersion - bVersion;
        });

        return { data: branchVersions };
      },

      validateStorage: () => {
        const state = validateStorage(get().versions, get().branches);
        set({ storageState: state });
        return state;
      },

      recoverFromCorruption: () => {
        const { versions, branches, storageState } = get();
        if (storageState.isStorageValid) {
          return {};
        }

        // Keep only valid versions and their branches
        const validVersions = new Map();
        const validBranches = new Map();

        for (let v = INITIAL_VERSION; v <= storageState.lastValidVersion; v++) {
          const version = versions.get(v);
          if (version && isValidVersion(version)) {
            validVersions.set(v, version);
            const branch = branches.get(version.branchId);
            if (branch && isValidBranch(branch)) {
              validBranches.set(branch.id, branch);
            }
          }
        }

        if (validVersions.size === 0) {
          // Initialize with main branch if no valid versions
          const mainBranch: Branch = {
            id: MAIN_BRANCH_ID,
            name: "Main",
            parentBranchId: null,
            parentVersionId: INITIAL_VERSION.toString(),
            currentVersionId: INITIAL_VERSION.toString(),
            createdAt: new Date().toISOString(),
            isMain: true,
          };

          set({
            versions: new Map(),
            branches: new Map([[MAIN_BRANCH_ID, mainBranch]]),
            activeBranchId: MAIN_BRANCH_ID,
            currentVersion: INITIAL_VERSION,
            hasContent: false,
            isInitialEditing: true,
          });

          return {
            error: {
              code: ERROR_CODE.STORAGE_ERROR,
              message: ERROR_MESSAGE.STORAGE_CORRUPTED,
            },
          };
        }

        set({
          versions: validVersions,
          branches: validBranches,
          currentVersion: storageState.lastValidVersion,
          hasContent: true,
          isInitialEditing: false,
        });

        return {
          error: {
            code: ERROR_CODE.STORAGE_ERROR,
            message: ERROR_MESSAGE.STORAGE_CORRUPTED,
          },
        };
      },

      saveVersion: debouncedSave,
      getVersionContent: (version: number) => {
        if (!get().hasContent || get().isInitialEditing) {
          return { data: undefined };
        }

        const { versions } = get();
        const error = validateVersion(version, versions);
        if (error) {
          return { error };
        }

        const versionData = versions.get(version);
        if (!versionData) {
          return {
            error: {
              code: ERROR_CODE.VERSION_NOT_FOUND,
              message: ERROR_MESSAGE.VERSION_CONTENT_NOT_FOUND(version),
            },
          };
        }

        if (!isValidVersion(versionData)) {
          return {
            error: {
              code: ERROR_CODE.CONTENT_CORRUPTED,
              message: ERROR_MESSAGE.CONTENT_CORRUPTED,
            },
          };
        }

        return { data: versionData.content };
      },
      getVersionRange: (fromVersion: number, toVersion: number) => {
        const error =
          validateVersion(fromVersion, get().versions) ||
          validateVersion(toVersion, get().versions);

        if (error) {
          return { error };
        }

        if (fromVersion > toVersion) {
          return {
            error: {
              code: ERROR_CODE.INVALID_VERSION,
              message: ERROR_MESSAGE.START_GREATER_THAN_END,
            },
          };
        }

        const versions: Version[] = [];
        for (let v = fromVersion; v <= toVersion; v++) {
          const version = get().versions.get(v);
          if (!version) {
            return {
              error: {
                code: ERROR_CODE.VERSION_NOT_FOUND,
                message: ERROR_MESSAGE.VERSION_NOT_FOUND(v),
              },
            };
          }
          versions.push(version);
        }

        return { data: versions };
      },
      applyStep: (pmStep: PMStep) => {
        const step = serializeStep(pmStep, get().currentVersion.toString());
        set((state) => ({
          steps: [...state.steps, step],
          isDirty: true,
        }));
      },
      setDirty: (isDirty: boolean) => {
        set({ isDirty });
      },
      reset: () => {
        set({
          currentVersion: INITIAL_VERSION,
          steps: [],
          lastSaved: new Date(),
          isDirty: false,
          documentState: null,
          versions: new Map(),
          branches: new Map(),
          activeBranchId: MAIN_BRANCH_ID,
          hasContent: false,
          isInitialEditing: true,
        });
      },
      setCurrentVersion: (version: number) => {
        const { versions } = get();
        const error = validateVersion(version, versions);
        if (error) {
          return { error };
        }

        set({ currentVersion: version });
        return {};
      },
    };
  }, persistOptions)
);
