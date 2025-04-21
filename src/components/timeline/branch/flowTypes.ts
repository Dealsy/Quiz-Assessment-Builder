import BranchNode from "./BranchNode";
import BranchEdge from "./BranchEdge";

export const nodeTypes = {
  branchNode: BranchNode,
} as const;

export const edgeTypes = {
  branchEdge: BranchEdge,
} as const;
