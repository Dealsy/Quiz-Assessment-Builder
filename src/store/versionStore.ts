import { create } from "zustand";
import { persist } from "zustand/middleware";
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

type VersionStore = {
  currentVersion: number;
  steps: Step[];
  lastSaved: Date;
  isDirty: boolean;
  documentState: DocumentState | null;
  versions: Map<number, Version>;
  saveVersion: (editorState: EditorState) => void;
  getVersionContent: (version: number) => JSONContent | undefined;
  applyStep: (step: PMStep) => void;
  setDirty: (isDirty: boolean) => void;
  reset: () => void;
  setCurrentVersion: (version: number) => void;
};

const STORAGE_KEY = "document-versions";
const SAVE_DEBOUNCE_MS = 1000;

const saveVersion = (
  editorState: EditorState,
  get: () => VersionStore,
  set: (state: Partial<VersionStore>) => void
) => {
  const { currentVersion, steps } = get();
  const newVersion = currentVersion + 1;
  const now = new Date();

  const version: Version = {
    steps,
    content: editorState.doc.toJSON(),
    timestamp: now.toISOString(),
  };

  const newVersions = new Map(get().versions);
  newVersions.set(newVersion, version);

  set({
    currentVersion: newVersion,
    versions: newVersions,
    lastSaved: now,
    isDirty: false,
    steps: [],
  });
};

export const useVersionStore = create<VersionStore>()(
  persist(
    (set, get) => {
      const debouncedSave = debounce<EditorState>(
        (editorState) => saveVersion(editorState, get, set),
        SAVE_DEBOUNCE_MS
      );

      return {
        currentVersion: INITIAL_VERSION,
        steps: [],
        lastSaved: new Date(),
        isDirty: false,
        documentState: null,
        versions: new Map(),

        saveVersion: debouncedSave,

        getVersionContent: (version: number) => {
          const versionData = get().versions.get(version);
          return versionData?.content;
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
          });
        },

        setCurrentVersion: (version: number) => {
          set({ currentVersion: version });
        },
      };
    },
    {
      name: STORAGE_KEY,
    }
  )
);
