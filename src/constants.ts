export const VERSION = {
  INITIAL: 1,
  STORAGE_KEY: "document-versions",
  SAVE_DEBOUNCE_MS: 1000,
} as const;

export const ERROR_CODE = {
  INVALID_VERSION: "INVALID_VERSION",
  VERSION_NOT_FOUND: "VERSION_NOT_FOUND",
  CONTENT_CORRUPTED: "CONTENT_CORRUPTED",
  STORAGE_ERROR: "STORAGE_ERROR",
  BRANCH_NOT_FOUND: "BRANCH_NOT_FOUND",
  INVALID_BRANCH: "INVALID_BRANCH",
  INVALID_CONTENT: "INVALID_CONTENT",
  INVALID_STORAGE: "INVALID_STORAGE",
  INVALID_OPERATION: "INVALID_OPERATION",
} as const;

export const ERROR_MESSAGE = {
  VERSION_INVALID: (version: number) => `Invalid version number: ${version}`,
  VERSION_NOT_FOUND: (version: number) => `Version ${version} not found`,
  STORAGE_CORRUPTED: "Storage is corrupted and cannot be recovered",
  STORAGE_RECOVERED: (version: number) =>
    `Storage recovered up to version ${version}`,
  START_GREATER_THAN_END: "Start version cannot be greater than end version",
  VERSION_CONTENT_NOT_FOUND: (version: number) =>
    `Version ${version} content not found`,
  CONTENT_CORRUPTED: "Version content is corrupted",
  BRANCH_NOT_FOUND: (branch: string) => `Branch ${branch} not found`,
  INVALID_BRANCH: (branch: string) => `Branch ${branch} is invalid`,
  INVALID_CONTENT: "Invalid content format",
  INVALID_STORAGE: "Invalid storage configuration",
  INVALID_OPERATION: "Invalid operation",
} as const;
