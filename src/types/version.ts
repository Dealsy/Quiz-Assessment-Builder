import { Step as PMStep } from "prosemirror-transform";
import { JSONContent } from "@tiptap/react";
import { Schema } from "prosemirror-model";

export const INITIAL_VERSION = 1;

export type Step = {
  from: number;
  to: number;
  stepType: string;
  clientID?: string;
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

export const serializeStep = (step: PMStep, clientID?: string): Step => {
  return {
    ...step.toJSON(),
    clientID,
  };
};

export const deserializeStep = (step: Step, schema: Schema): PMStep => {
  const { clientID: _, ...stepData } = step;
  return PMStep.fromJSON(schema, stepData);
};

export type StoredDocument = {
  versions: Record<number, Version>;
  currentVersion: number;
};
