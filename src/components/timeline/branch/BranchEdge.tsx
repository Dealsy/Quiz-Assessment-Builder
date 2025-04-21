import { BaseEdge, EdgeProps, getBezierPath, MarkerType } from "reactflow";

type BranchEdgeProps = EdgeProps & {
  data?: {
    isBranchPoint: boolean;
  };
};

export default function BranchEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
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
      markerEnd={markerEnd || MarkerType.Arrow}
      style={{
        strokeWidth: 2,
        stroke: data?.isBranchPoint ? "#ad46ff" : "#64748b",
        strokeDasharray: "5 5",
        ...style,
      }}
    />
  );
}
