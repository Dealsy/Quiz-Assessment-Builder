import { Step as PMStep } from "prosemirror-transform";
import { JSONContent } from "@tiptap/react";

export const INITIAL_VERSION = 1;

export type Step = {
  id: string;
  version: number;
  timestamp: string;
  step: PMStep;
};

export type Version = {
  steps: Step[];
  content: JSONContent;
  timestamp: string;
};

export type DocumentState = {
  version: number;
  doc: JSONContent;
  steps: Step[];
};

export type StoredDocument = {
  versions: Record<number, Version>;
  currentVersion: number;
};
