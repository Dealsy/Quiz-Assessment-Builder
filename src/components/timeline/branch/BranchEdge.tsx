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
}: BranchEdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isDarkMode = document.documentElement.classList.contains("dark");

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd || MarkerType.Arrow}
      style={{
        strokeWidth: 2,
        stroke: isDarkMode ? "#4B5563" : "#9CA3AF",
        strokeDasharray: "5 5",
        ...style,
      }}
    />
  );
}
