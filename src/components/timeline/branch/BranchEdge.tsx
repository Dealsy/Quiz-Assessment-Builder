import { memo } from "react";
import { BaseEdge, EdgeProps, getBezierPath } from "reactflow";

type BranchEdgeProps = EdgeProps & {
  data?: {
    isBranchPoint: boolean;
  };
};

export default memo(function BranchEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: BranchEdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      path={edgePath}
      style={{
        strokeWidth: 2,
        stroke: data?.isBranchPoint ? "#3B82F6" : "#D1D5DB",
      }}
    />
  );
});
