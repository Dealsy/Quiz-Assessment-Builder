import { Step as PMStep } from "prosemirror-transform";
import { JSONContent } from "@tiptap/react";
import { Schema } from "prosemirror-model";
import { ERROR_CODE } from "../constants";

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
  branchId: string;
  parentVersion: string | null;
};

export type Branch = {
  id: string;
  name: string;
  parentBranchId: string | null;
  parentVersionId: string;
  currentVersionId: string;
  createdAt: string;
  isMain: boolean;
};

export type BranchVersion = {
  version: Version;
  branch: Branch;
  isHead: boolean;
};

export type DocumentState = {
  version: number;
  doc: JSONContent;
  steps: Step[];
  branchId: string;
};

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export type OperationError = {
  code: ErrorCode;
  message: string;
};

export type Result<T> = {
  data?: T;
  error?: OperationError;
};

export const serializeStep = (step: PMStep, clientID?: string): Step => {
  return {
    ...step.toJSON(),
    clientID,
  };
};

export const deserializeStep = (step: Step, schema: Schema): PMStep => {
  const { ...stepData } = step;
  return PMStep.fromJSON(schema, stepData);
};

export type StoredDocument = {
  versions: Record<number, Version>;
  branches: Record<string, Branch>;
  currentVersion: number;
  activeBranchId: string;
};
