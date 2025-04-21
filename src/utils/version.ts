import { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { Result, Version, Branch } from "@/types/version";
import { JSONContent } from "@tiptap/react";
import { TOAST_MESSAGE, VERSION, BRANCH } from "@/constants";

type VersionRange = {
  min: number;
  max: number;
};

export const isValidVersion = (
  version: Version | null | undefined
): version is Version => {
  if (!version) return false;

  const hasValidStringProps = VERSION.REQUIRED_STRING_PROPS.every(
    (prop) => typeof version[prop] === "string"
  );

  return (
    hasValidStringProps &&
    Array.isArray(version.steps) &&
    version.content !== undefined
  );
};

export const isValidBranch = (
  branch: Branch | null | undefined
): branch is Branch => {
  if (!branch) return false;

  return BRANCH.REQUIRED_STRING_PROPS.every(
    (prop) => typeof branch[prop] === "string"
  );
};

export const calculateBranchVersionRange = (
  versions: Version[],
  minVersion: number
): VersionRange => {
  if (!versions.length) {
    return { min: minVersion, max: minVersion };
  }

  const versionNumbers = versions.map(
    (version) => Number(version.parentVersion || 0) + 1
  );

  return {
    min: Math.min(...versionNumbers, minVersion),
    max: Math.max(...versionNumbers, minVersion),
  };
};

export const handleVersionContentChange = (
  version: number,
  editor: Editor | null,
  getVersionContent: (version: number) => Result<JSONContent>
): boolean => {
  if (!editor) return false;

  const content = getVersionContent(version);
  if (content.error) {
    toast.error(TOAST_MESSAGE.ERROR.VERSION_CONTENT.title, {
      description: TOAST_MESSAGE.ERROR.VERSION_CONTENT.description(
        content.error.message
      ),
    });
    return false;
  }

  if (content.data) {
    editor.commands.setContent(content.data);
    return true;
  }

  return false;
};

export const handleVersionChange = (
  version: number,
  versionRange: VersionRange,
  editor: Editor | null,
  setCurrentVersion: (version: number) => Result<void>,
  getVersionContent: (version: number) => Result<JSONContent>
): boolean => {
  if (version < versionRange.min || version > versionRange.max) {
    toast.error(TOAST_MESSAGE.ERROR.VERSION_RANGE.title, {
      description: TOAST_MESSAGE.ERROR.VERSION_RANGE.description,
    });
    return false;
  }

  const result = setCurrentVersion(version);
  if (result.error) {
    toast.error(TOAST_MESSAGE.ERROR.VERSION_CHANGE.title, {
      description: TOAST_MESSAGE.ERROR.VERSION_CHANGE.description(
        result.error.message
      ),
    });
    return false;
  }

  return handleVersionContentChange(version, editor, getVersionContent);
};

export const handleSliderChange = (
  values: number[],
  versionRange: VersionRange,
  editor: Editor | null,
  setCurrentVersion: (version: number) => Result<void>,
  getVersionContent: (version: number) => Result<JSONContent>
): boolean => {
  const version = values[0];
  return handleVersionChange(
    version,
    versionRange,
    editor,
    setCurrentVersion,
    getVersionContent
  );
};
