import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { BranchVersion } from "@/types/version";
import BranchNode from "./BranchNode";
import BranchEdge from "./BranchEdge";
import BranchControls from "./BranchControls";

type BranchViewProps = {
  versions: BranchVersion[];
  selectedVersion?: string;
  onBranchCreate: (parentVersionId: string) => void;
  onBranchSwitch: (branchId: string) => void;
  onVersionSelect: (versionId: string) => void;
};

const nodeTypes: NodeTypes = {
  branchNode: BranchNode,
};

const edgeTypes: EdgeTypes = {
  branchEdge: BranchEdge,
};

export default function BranchView({
  versions,
  selectedVersion,
  onBranchCreate,
  onBranchSwitch,
  onVersionSelect,
}: BranchViewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { nodes, edges, branches, activeBranchId } = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];
    const processedVersions = new Set<string>();
    const branchMap = new Map<string, BranchVersion["branch"]>();

    // Calculate vertical spacing based on branches
    const branchYPositions = new Map<string, number>();
    let currentY = 0;
    const ySpacing = 150;

    versions.forEach((version) => {
      const branchId = version.branch.id;
      if (!branchYPositions.has(branchId)) {
        branchYPositions.set(branchId, currentY);
        currentY += ySpacing;
      }
      branchMap.set(version.branch.id, version.branch);
    });

    // Create nodes and edges
    versions.forEach((version) => {
      const versionId = version.version.parentVersion || "0";
      if (processedVersions.has(versionId)) return;
      processedVersions.add(versionId);

      const y = branchYPositions.get(version.branch.id) || 0;
      const x = parseInt(versionId) * 200;

      // Create node
      nodeMap.set(versionId, {
        id: versionId,
        type: "branchNode",
        position: { x, y },
        data: {
          version,
          isHead: version.isHead,
          isSelected: versionId === selectedVersion,
          onSelect: () => onVersionSelect(versionId),
        },
      });

      // Create edge if there's a parent version
      if (version.version.parentVersion) {
        const edge = {
          id: `${version.version.parentVersion}-${versionId}`,
          source: version.version.parentVersion,
          target: versionId,
          type: "branchEdge",
          data: {
            isBranchPoint:
              version.branch.parentVersionId === version.version.parentVersion,
          },
        };
        edgeList.push(edge);

        // If this is a branch point, add a context menu for branch creation
        if (edge.data.isBranchPoint) {
          const existingNode = nodeMap.get(version.version.parentVersion);
          if (existingNode) {
            existingNode.data = {
              ...existingNode.data,
              onBranchCreate: () =>
                handleBranchCreate(version.version.parentVersion!),
              onBranchSwitch: () => handleBranchSwitch(version.branch.id),
            };
          }
        }
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges: edgeList,
      branches: Array.from(branchMap.values()),
      activeBranchId: versions[0]?.branch.id || "",
    };
  }, [versions, selectedVersion, onVersionSelect]);

  const [flowNodes, , onNodesChange] = useNodesState(nodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(edges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onVersionSelect(node.id);
    },
    [onVersionSelect]
  );

  const handleBranchCreate = useCallback(
    async (parentVersionId: string) => {
      setIsLoading(true);
      try {
        await onBranchCreate(parentVersionId);
      } finally {
        setIsLoading(false);
      }
    },
    [onBranchCreate]
  );

  const handleBranchSwitch = useCallback(
    async (branchId: string) => {
      setIsLoading(true);
      try {
        await onBranchSwitch(branchId);
      } finally {
        setIsLoading(false);
      }
    },
    [onBranchSwitch]
  );

  return (
    <div className="flex flex-col h-full">
      <BranchControls
        branches={branches}
        activeBranchId={activeBranchId}
        onBranchSwitch={handleBranchSwitch}
        isLoading={isLoading}
      />
      <div className="flex-1">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
