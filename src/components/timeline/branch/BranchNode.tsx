import { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import { BranchVersion } from "@/types/version";
import { GitBranch, GitCommit } from "lucide-react";
import { cn } from "@/lib/utils";

type BranchNodeProps = {
  data: {
    version: BranchVersion;
    isHead: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onBranchCreate?: () => void;
    onBranchSwitch?: () => void;
  };
};

export default memo(function BranchNode({ data }: BranchNodeProps) {
  const {
    version,
    isHead,
    isSelected,
    onSelect,
    onBranchCreate,
    onBranchSwitch,
  } = data;
  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBranchCreate || onBranchSwitch) {
      setShowMenu(true);
    }
  };

  const timestamp = new Date(version.version.timestamp);
  const timeAgo = getTimeAgo(timestamp);

  return (
    <div
      className="relative"
      onContextMenu={handleContextMenu}
      onClick={() => {
        setShowMenu(false);
        onSelect();
      }}
    >
      <div
        className={cn(
          "px-4 py-3 rounded-lg border transition-all",
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
          isHead && "ring-2 ring-green-500 ring-offset-2"
        )}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-gray-400 !w-3 !h-3 !-left-1.5"
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">
              Version {version.version.parentVersion}
            </span>
            {isHead && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                HEAD
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{timeAgo}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {version.branch.name}
            </span>
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-gray-400 !w-3 !h-3 !-right-1.5"
        />
      </div>

      {showMenu && (onBranchCreate || onBranchSwitch) && (
        <div className="absolute z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {onBranchCreate && (
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onBranchCreate();
                  setShowMenu(false);
                }}
              >
                <GitBranch className="h-4 w-4" />
                Create Branch Here
              </button>
            )}
            {onBranchSwitch && (
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onBranchSwitch();
                  setShowMenu(false);
                }}
              >
                <GitCommit className="h-4 w-4" />
                Switch to Branch
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
