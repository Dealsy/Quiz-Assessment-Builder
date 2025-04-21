export const VERSION = {
  INITIAL: 1,
  STORAGE_KEY: "document-versions",
  SAVE_DEBOUNCE_MS: 1000,
  REQUIRED_STRING_PROPS: ["timestamp", "branchId"] as const,
} as const;

export const BRANCH = {
  ID: "main",
  REQUIRED_STRING_PROPS: [
    "id",
    "name",
    "currentVersionId",
    "createdAt",
  ] as const,
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

export const TOAST_MESSAGE = {
  ERROR: {
    BRANCH_NOT_FOUND: {
      title: "Branch not found",
      description: (branchId: string) =>
        `Could not find branch with ID: ${branchId}`,
    },
    BRANCH_SWITCH: {
      title: "Branch switch error",
      description: (message: string) => message,
    },
    NO_VERSIONS: {
      title: "No versions found",
      description: (branchName: string) =>
        `No versions found for branch: ${branchName}`,
    },
    BRANCH_CREATE: {
      title: "Failed to create branch",
      description: (message: string) => message,
    },
    VERSION_CHANGE: {
      title: "Version change error",
      description: (message: string) => message,
    },
    VERSION_CONTENT: {
      title: "Content fetch error",
      description: (message: string) => message,
    },
    VERSION_RANGE: {
      title: "Invalid version range",
      description: "Start version cannot be greater than end version",
    },
  },
  SUCCESS: {
    BRANCH_CREATE: {
      title: "Branch created",
      description: (branchName: string) =>
        `Successfully created branch: ${branchName}`,
    },
  },
} as const;
