import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";

import { useVersionStore } from "@/store/versionStore";
import BranchNode from "./BranchNode";
import BranchEdge from "./BranchEdge";

type BranchViewProps = {
  onVersionSelect: (versionId: string) => void;
  onEdit: (versionId: string) => void;
};

export default function BranchView({
  onVersionSelect,
  onEdit,
}: BranchViewProps) {
  const nodeTypes = useMemo(() => ({ branchNode: BranchNode }), []);
  const edgeTypes = useMemo(() => ({ branchEdge: BranchEdge }), []);

  const branches = useVersionStore((state) => state.branches);
  const activeBranchId = useVersionStore((state) => state.activeBranchId);

  // Force rerender when branches change
  const branchesArray = useMemo(
    () => Array.from(branches.values()),
    [branches]
  );

  // Transform branches into nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processedBranches = new Set<string>();
    const branchLevels = new Map<string, number>();
    const childrenByParent = new Map<string, string[]>();

    // First pass: Build the parent-child relationships
    branchesArray.forEach((branch) => {
      if (branch.parentBranchId) {
        const siblings = childrenByParent.get(branch.parentBranchId) || [];
        siblings.push(branch.id);
        childrenByParent.set(branch.parentBranchId, siblings);
      }
    });

    // Helper to calculate branch level
    const calculateBranchLevel = (branchId: string, level = 0): number => {
      if (branchLevels.has(branchId)) return branchLevels.get(branchId)!;

      const branch = branches.get(branchId);
      if (!branch || !branch.parentBranchId) {
        branchLevels.set(branchId, level);
        return level;
      }

      const parentLevel = calculateBranchLevel(branch.parentBranchId, level);
      const currentLevel = parentLevel + 1;
      branchLevels.set(branchId, currentLevel);
      return currentLevel;
    };

    // Process main branch first
    const mainBranch = branchesArray.find((b) => b.isMain);
    if (mainBranch) {
      calculateBranchLevel(mainBranch.id);
      nodes.push({
        id: mainBranch.id,
        type: "branchNode",
        position: { x: 250, y: 5 },
        data: {
          version: {
            version: { parentVersion: mainBranch.parentVersionId },
            branch: mainBranch,
            isHead: true,
          },
          isHead: true,
          isSelected: mainBranch.id === activeBranchId,
          onSelect: () => onVersionSelect(mainBranch.parentVersionId),
          onEdit: () => onEdit(mainBranch.parentVersionId),
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      processedBranches.add(mainBranch.id);
    }

    // Process remaining branches
    const processChildren = (
      parentId: string,
      parentX: number,
      level: number
    ) => {
      const children = childrenByParent.get(parentId) || [];
      const totalWidth = (children.length - 1) * 300; // Space between siblings
      let startX = parentX - totalWidth / 2;

      children.forEach((childId) => {
        if (processedBranches.has(childId)) return;

        const branch = branches.get(childId)!;
        const x = startX;
        const y = level * 150;

        nodes.push({
          id: childId,
          type: "branchNode",
          position: { x, y },
          data: {
            version: {
              version: { parentVersion: branch.parentVersionId },
              branch,
              isHead: true,
            },
            isHead: true,
            isSelected: childId === activeBranchId,
            onSelect: () => onVersionSelect(branch.parentVersionId),
            onEdit: () => onEdit(branch.parentVersionId),
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        edges.push({
          id: `e${parentId}-${childId}`,
          source: parentId,
          target: childId,
          type: "branchEdge",
          data: { isBranchPoint: true },
          markerEnd: MarkerType.Arrow,
        });

        processedBranches.add(childId);
        processChildren(childId, x, level + 1);
        startX += 300; // Move to next sibling position
      });
    };

    if (mainBranch) {
      processChildren(mainBranch.id, 250, 1);
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [branches, activeBranchId, onVersionSelect, onEdit, branchesArray]);

  const [flowNodes, , onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onVersionSelect(node.id);
    },
    [onVersionSelect]
  );

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0,
          minZoom: 1.2,
          maxZoom: 1.2,
        }}
        style={{ backgroundColor: "transparent" }}
        className="dark:bg-gray-950 bg-gray-50"
        defaultEdgeOptions={{
          type: "branchEdge",
          animated: true,
        }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Controls className="dark:bg-gray-900 dark:border-gray-800" />
        <Background color="#aaa" gap={16} className="dark:opacity-20" />
      </ReactFlow>
    </div>
  );
}
