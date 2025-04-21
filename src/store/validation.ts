import { ERROR_CODE, ERROR_MESSAGE } from "../constants";
import { ValidationResult } from "@/types/validation";
import { VersionStoreState } from "@/types/store";

export function isValidVersion(
  version: number,
  store: VersionStoreState
): ValidationResult {
  if (version < 0 || version >= store.steps.length) {
    return {
      isValid: false,
      error: {
        code: ERROR_CODE.INVALID_VERSION,
        message: ERROR_MESSAGE.VERSION_INVALID(version),
      },
    };
  }
  return { isValid: true };
}

export function isValidBranch(
  branchId: string,
  store: VersionStoreState
): ValidationResult {
  if (
    typeof branchId !== "string" ||
    (!store.branches.has(branchId) && branchId !== "main")
  ) {
    return {
      isValid: false,
      error: {
        code: ERROR_CODE.INVALID_VERSION,
        message: `Invalid branch: ${branchId}`,
      },
    };
  }
  return { isValid: true };
}

export function validateVersionContent(content: unknown): ValidationResult {
  if (!content || typeof content !== "object") {
    return {
      isValid: false,
      error: {
        code: ERROR_CODE.CONTENT_CORRUPTED,
        message: ERROR_MESSAGE.CONTENT_CORRUPTED,
      },
    };
  }
  return { isValid: true };
}

export function validateStorage(storage: unknown): ValidationResult {
  if (!storage || typeof storage !== "object") {
    return {
      isValid: false,
      error: {
        code: ERROR_CODE.STORAGE_ERROR,
        message: ERROR_MESSAGE.STORAGE_CORRUPTED,
      },
    };
  }
  return { isValid: true };
}
