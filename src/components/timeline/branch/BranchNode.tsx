import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { BranchVersion } from "@/types/version";
import { GitBranch, GitCommit, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getTimeAgo } from "@/utils/date";

type BranchNodeProps = {
  data: {
    version: BranchVersion;
    isHead: boolean;
    isSelected?: boolean;
    onSelect: () => void;
    onEdit?: () => void;
  };
};

export default memo(function BranchNode({ data }: BranchNodeProps) {
  const { version, isHead, onSelect, onEdit } = data;

  const timestamp = new Date(version.branch.createdAt);
  const timeAgo = getTimeAgo(timestamp);

  return (
    <div
      className="relative group"
      onClick={() => {
        onSelect();
      }}
    >
      <div
        className={cn(
          "px-4 py-3 rounded-xl border transition-all duration-200",
          "dark:border-gray-950/50 dark:bg-black/95 border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm",
          "dark:text-white text-gray-900",
          "dark:hover:bg-gray-900 hover:bg-gray-50 dark:hover:border-gray-800 hover:border-gray-300 hover:shadow-md",
          isHead &&
            "ring-2 dark:ring-white/30 ring-black/60 ring-offset-2 dark:ring-offset-black"
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="dark:!bg-gray-600 !bg-gray-400 !w-3 !h-3 !-top-1.5 transition-colors duration-200 group-hover:!bg-purple-500"
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="dark:bg-gray-800 bg-gray-100 p-1 rounded-md dark:group-hover:bg-purple-900 group-hover:bg-purple-100 transition-colors duration-200">
              <GitCommit className="h-3.5 w-3.5 dark:text-gray-300 text-gray-600 dark:group-hover:text-purple-300 group-hover:text-purple-600 transition-colors duration-200" />
            </div>
            <span className="text-xs font-medium dark:text-gray-100 text-gray-800 leading-tight">
              Created from Version {version.version.parentVersion}
            </span>
            {isHead && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold dark:bg-green-900 bg-green-100 dark:text-green-100 text-green-700 rounded-full dark:border-green-700 border-green-200 border shadow-sm ml-auto">
                HEAD
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] justify-between dark:text-gray-400 text-gray-500">
            <span className="font-medium">Created {timeAgo}</span>
            <span className="dark:text-gray-600 text-gray-300">•</span>
            <span className="flex items-center gap-1 dark:bg-gray-800 bg-gray-100 px-1.5 py-0.5 rounded-full dark:group-hover:bg-purple-900 group-hover:bg-purple-100 transition-colors duration-200">
              <GitBranch className="h-2.5 w-2.5 dark:text-gray-300 text-gray-600 dark:group-hover:text-purple-300 group-hover:text-purple-600 transition-colors duration-200" />
              <span className="font-medium dark:group-hover:text-purple-200 group-hover:text-purple-700 transition-colors duration-200 truncate max-w-[120px]">
                {version.branch.name}
              </span>
            </span>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1.5 h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            )}
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="dark:!bg-gray-600 !bg-gray-400 !w-3 !h-3 !-bottom-1.5 transition-colors duration-200 group-hover:!bg-purple-500"
        />
      </div>
    </div>
  );
});
