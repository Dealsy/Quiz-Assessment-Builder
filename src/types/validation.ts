import { ERROR_CODE } from "@/constants";
import { Branch, Version } from "./version";

export type ValidationError = {
  code: (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
  message: string;
};

export type Result<T> = {
  data?: T;
  error?: ValidationError;
};

export type ValidationResult<T = void> = {
  isValid: boolean;
  data?: T;
  error?: ValidationError;
};

export type StorageValidationState = {
  isStorageValid: boolean;
  lastValidVersion: number;
};

export type Validator<T> = (value: T) => ValidationResult;

export type VersionValidator = {
  validateVersion: (version: Version | null | undefined) => version is Version;
  validateVersionNumber: (
    version: number,
    maxVersion: number
  ) => ValidationResult;
  validateVersionContent: (content: unknown) => ValidationResult;
};

export type BranchValidator = {
  validateBranch: (branch: Branch | null | undefined) => branch is Branch;
  validateBranchId: (
    branchId: string,
    branches: Map<string, Branch>
  ) => ValidationResult;
};

export type StorageValidator = {
  validateStorage: (storage: unknown) => ValidationResult;
  validateStorageState: (
    versions: Map<number, Version>,
    branches: Map<string, Branch>
  ) => StorageValidationState;
};
