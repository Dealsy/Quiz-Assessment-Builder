import { Editor, JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { Branch, Result, BranchVersion } from "@/types/version";
import { handleVersionContentChange } from "./version";
import { TOAST_MESSAGE } from "@/constants";

export const handleBranchSwitch = (
  branchId: string,
  branches: Map<string, Branch>,
  editor: Editor | null,
  switchBranch: (branchId: string) => Result<void>,
  getBranchVersions: (branchId: string) => Result<BranchVersion[]>,
  getVersionContent: (version: number) => Result<JSONContent>
): boolean => {
  const branch = branches.get(branchId);
  if (!branch) {
    toast.error(TOAST_MESSAGE.ERROR.BRANCH_NOT_FOUND.title, {
      description: TOAST_MESSAGE.ERROR.BRANCH_NOT_FOUND.description(branchId),
    });
    return false;
  }

  const result = switchBranch(branchId);
  if (result.error) {
    toast.error(TOAST_MESSAGE.ERROR.BRANCH_SWITCH.title, {
      description: TOAST_MESSAGE.ERROR.BRANCH_SWITCH.description(
        result.error.message
      ),
    });
    return false;
  }

  const branchVersionsResult = getBranchVersions(branchId);
  if (!branchVersionsResult.data || branchVersionsResult.data.length === 0) {
    toast.error(TOAST_MESSAGE.ERROR.NO_VERSIONS.title, {
      description: TOAST_MESSAGE.ERROR.NO_VERSIONS.description(branch.name),
    });
    return false;
  }

  const targetVersion = Number(branch.currentVersionId);
  return handleVersionContentChange(targetVersion, editor, getVersionContent);
};

export const handleBranchCreate = (
  parentVersionId: string,
  editor: Editor | null,
  createBranch: (parentVersionId: string) => Result<Branch>,
  getVersionContent: (version: number) => Result<JSONContent>
): boolean => {
  const result = createBranch(parentVersionId);
  if (result.error) {
    toast.error(TOAST_MESSAGE.ERROR.BRANCH_CREATE.title, {
      description: TOAST_MESSAGE.ERROR.BRANCH_CREATE.description(
        result.error.message
      ),
    });
    return false;
  }

  if (result.data) {
    const newBranch = result.data;
    toast.success(TOAST_MESSAGE.SUCCESS.BRANCH_CREATE.title, {
      description: TOAST_MESSAGE.SUCCESS.BRANCH_CREATE.description(
        newBranch.name
      ),
    });

    return handleVersionContentChange(
      Number(parentVersionId),
      editor,
      getVersionContent
    );
  }

  return false;
};

export const getAllBranches = (branches: Map<string, Branch>): Branch[] => {
  const branchList = Array.from(branches.values());
  const mainBranch = branchList.find((b) => b.isMain);
  const otherBranches = branchList.filter((b) => !b.isMain);
  return mainBranch ? [mainBranch, ...otherBranches] : otherBranches;
};
