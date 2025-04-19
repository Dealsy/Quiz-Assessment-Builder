import { create } from "zustand";
import { persist, PersistOptions, StorageValue } from "zustand/middleware";
import { EditorState } from "@tiptap/pm/state";
import { JSONContent } from "@tiptap/react";
import { Step as PMStep } from "prosemirror-transform";
import {
  Step,
  DocumentState,
  INITIAL_VERSION,
  Version,
} from "../types/version";
import { generateId } from "../utils/id";
import { debounce } from "../utils/debounce";

type VersionError = {
  code:
    | "VERSION_NOT_FOUND"
    | "INVALID_VERSION"
    | "CONTENT_CORRUPTED"
    | "STORAGE_ERROR";
  message: string;
};

type Result<T> = {
  data?: T;
  error?: VersionError;
};

type StorageState = {
  isStorageValid: boolean;
  lastValidVersion: number;
};

type VersionStore = {
  currentVersion: number;
  steps: Step[];
  lastSaved: Date;
  isDirty: boolean;
  documentState: DocumentState | null;
  versions: Map<number, Version>;
  hasContent: boolean;
  isInitialEditing: boolean;
  storageState: StorageState;
  saveVersion: (editorState: EditorState) => void;
  getVersionContent: (version: number) => Result<JSONContent>;
  getVersionRange: (
    fromVersion: number,
    toVersion: number
  ) => Result<Version[]>;
  applyStep: (step: PMStep) => void;
  setDirty: (isDirty: boolean) => void;
  reset: () => void;
  setCurrentVersion: (version: number) => Result<void>;
  validateStorage: () => StorageState;
  recoverFromCorruption: () => Result<void>;
};

const STORAGE_KEY = "document-versions";
const SAVE_DEBOUNCE_MS = 1000;

const isValidVersion = (version: Version): boolean => {
  return (
    version &&
    typeof version.timestamp === "string" &&
    Array.isArray(version.steps) &&
    version.content !== undefined
  );
};

const validateStorage = (versions: Map<number, Version>): StorageState => {
  let lastValidVersion = INITIAL_VERSION;
  let isValid = true;

  for (const [versionNum, version] of versions.entries()) {
    if (!isValidVersion(version)) {
      isValid = false;
      break;
    }
    lastValidVersion = versionNum;
  }

  return {
    isStorageValid: isValid,
    lastValidVersion,
  };
};

const validateVersion = (
  version: number,
  maxVersion: number
): VersionError | undefined => {
  if (version < INITIAL_VERSION) {
    return {
      code: "INVALID_VERSION",
      message: `Version ${version} is invalid. Versions start at ${INITIAL_VERSION}`,
    };
  }
  if (version > maxVersion) {
    return {
      code: "INVALID_VERSION",
      message: `Version ${version} does not exist. Latest version is ${maxVersion}`,
    };
  }
};

const saveVersion = (
  editorState: EditorState,
  get: () => VersionStore,
  set: (state: Partial<VersionStore>) => void
) => {
  const { currentVersion, steps, versions } = get();
  // Only increment if we already have content saved
  const newVersion = versions.size > 0 ? currentVersion + 1 : INITIAL_VERSION;
  const now = new Date();

  const version: Version = {
    steps,
    content: editorState.doc.toJSON(),
    timestamp: now.toISOString(),
  };

  const newVersions = new Map(versions);
  newVersions.set(newVersion, version);

  set({
    currentVersion: newVersion,
    versions: newVersions,
    lastSaved: now,
    isDirty: false,
    steps: [],
  });
};

const persistOptions: PersistOptions<VersionStore> = {
  name: STORAGE_KEY,
  storage: {
    getItem: (name): StorageValue<VersionStore> | null => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const state = JSON.parse(str);
      return {
        state: {
          ...state,
          versions: new Map(state.versions),
          lastSaved: new Date(state.lastSaved),
        },
      };
    },
    setItem: (name, value) => {
      const state = value.state;
      const serialized = JSON.stringify({
        ...state,
        versions: Array.from(state.versions.entries()),
        lastSaved: state.lastSaved.toISOString(),
      });
      localStorage.setItem(name, serialized);
    },
    removeItem: (name) => localStorage.removeItem(name),
  },
};

export const useVersionStore = create<VersionStore>()(
  persist(
    (set, get) => {
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
        hasContent: false,
        isInitialEditing: true,
        storageState: {
          isStorageValid: true,
          lastValidVersion: INITIAL_VERSION,
        },

        validateStorage: () => {
          const state = validateStorage(get().versions);
          set({ storageState: state });
          return state;
        },

        recoverFromCorruption: () => {
          const { versions, storageState } = get();
          if (storageState.isStorageValid) {
            return {};
          }

          // Keep only valid versions
          const validVersions = new Map();
          for (
            let v = INITIAL_VERSION;
            v <= storageState.lastValidVersion;
            v++
          ) {
            const version = versions.get(v);
            if (version && isValidVersion(version)) {
              validVersions.set(v, version);
            }
          }

          if (validVersions.size === 0) {
            set({
              versions: new Map(),
              currentVersion: INITIAL_VERSION,
              hasContent: false,
              isInitialEditing: true,
            });
            return {
              error: {
                code: "STORAGE_ERROR",
                message: "Storage was corrupted. All content has been reset.",
              },
            };
          }

          set({
            versions: validVersions,
            currentVersion: storageState.lastValidVersion,
            hasContent: true,
            isInitialEditing: false,
          });

          return {
            error: {
              code: "STORAGE_ERROR",
              message: `Recovered to last valid version: ${storageState.lastValidVersion}`,
            },
          };
        },

        saveVersion: (editorState: EditorState) => {
          debouncedSave(editorState);
          if (!get().hasContent) {
            set({ hasContent: true });
          }
          set({ isDirty: true });
        },

        getVersionContent: (version: number) => {
          if (!get().hasContent || get().isInitialEditing) {
            return { data: undefined };
          }

          const error = validateVersion(version, get().currentVersion);
          if (error) {
            return { error };
          }

          const versionData = get().versions.get(version);
          if (!versionData) {
            return {
              error: {
                code: "VERSION_NOT_FOUND",
                message: `Version ${version} content not found`,
              },
            };
          }

          if (!isValidVersion(versionData)) {
            return {
              error: {
                code: "CONTENT_CORRUPTED",
                message: `Version ${version} content is corrupted`,
              },
            };
          }

          return { data: versionData.content };
        },

        getVersionRange: (fromVersion: number, toVersion: number) => {
          const error =
            validateVersion(fromVersion, get().currentVersion) ||
            validateVersion(toVersion, get().currentVersion);

          if (error) {
            return { error };
          }

          if (fromVersion > toVersion) {
            return {
              error: {
                code: "INVALID_VERSION",
                message: "Start version cannot be greater than end version",
              },
            };
          }

          const versions: Version[] = [];
          for (let v = fromVersion; v <= toVersion; v++) {
            const version = get().versions.get(v);
            if (!version) {
              return {
                error: {
                  code: "VERSION_NOT_FOUND",
                  message: `Version ${v} not found in range ${fromVersion}-${toVersion}`,
                },
              };
            }
            versions.push(version);
          }

          return { data: versions };
        },

        applyStep: (step: PMStep) => {
          const newStep: Step = {
            id: generateId(),
            version: get().currentVersion,
            timestamp: new Date().toISOString(),
            step,
          };

          set((state) => ({
            steps: [...state.steps, newStep],
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
            hasContent: false,
            isInitialEditing: true,
          });
        },

        setCurrentVersion: (version: number) => {
          const error = validateVersion(version, get().currentVersion);
          if (error) {
            return { error };
          }

          set({ currentVersion: version });
          return {};
        },
      };
    },
    {
      ...persistOptions,
      onRehydrateStorage: () => (state) => {
        if (state) {
          const storageState = validateStorage(state.versions);
          state.storageState = storageState;

          if (!storageState.isStorageValid) {
            state.recoverFromCorruption();
          }
        }
      },
    }
  )
);
