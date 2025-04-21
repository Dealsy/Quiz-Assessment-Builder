import { ERROR_CODE } from "../constants";

export type StorageState = {
  steps: VersionContent[];
  branches: Record<string, Branch>;
  currentVersion: number;
  currentBranchId: string;
};

export type VersionContent = {
  content: unknown;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

export type Branch = {
  name: string;
  startVersion: number;
  versions: number[];
};

export type Result<T> = {
  data?: T;
  error?: {
    code: (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
    message: string;
  };
};
