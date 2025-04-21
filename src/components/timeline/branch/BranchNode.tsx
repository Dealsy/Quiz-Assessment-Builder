"use client";

import type React from "react";

import { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import type { BranchVersion } from "@/types/version";
import { GitBranch, GitCommit, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BranchNodeProps = {
  data: {
    version: BranchVersion;
    isHead: boolean;
    onSelect: () => void;
    onBranchCreate?: () => void;
    onBranchSwitch?: () => void;
  };
};

export default memo(function BranchNode({ data }: BranchNodeProps) {
  const { version, isHead, onSelect, onBranchCreate, onBranchSwitch } = data;
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
      className="relative group"
      onContextMenu={handleContextMenu}
      onClick={() => {
        setShowMenu(false);
        onSelect();
      }}
    >
      <div
        className={cn(
          "px-5 py-3.5 rounded-xl border transition-all duration-200",
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="dark:bg-gray-800 bg-gray-100 p-1.5 rounded-md dark:group-hover:bg-purple-900 group-hover:bg-purple-100 transition-colors duration-200">
              <GitCommit className="h-4 w-4 dark:text-gray-300 text-gray-600 dark:group-hover:text-purple-300 group-hover:text-purple-600 transition-colors duration-200" />
            </div>
            <span className="text-sm font-medium dark:text-gray-100 text-gray-800">
              Version {version.version.parentVersion}
            </span>
            {isHead && (
              <span className="px-2 py-0.5 text-xs font-semibold dark:bg-green-900 bg-green-100 dark:text-green-100 text-green-700 rounded-full dark:border-green-700 border-green-200 border shadow-sm">
                HEAD
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs dark:text-gray-400 text-gray-500 pl-1">
            <span className="font-medium">{timeAgo}</span>
            <span className="dark:text-gray-600 text-gray-300">•</span>
            <span className="flex items-center gap-1.5 dark:bg-gray-800 bg-gray-100 px-2 py-1 rounded-full dark:group-hover:bg-purple-900 group-hover:bg-purple-100 transition-colors duration-200">
              <GitBranch className="h-3 w-3 dark:text-gray-300 text-gray-600 dark:group-hover:text-purple-300 group-hover:text-purple-600 transition-colors duration-200" />
              <span className="font-medium dark:group-hover:text-purple-200 group-hover:text-purple-700 transition-colors duration-200">
                {version.branch.name}
              </span>
            </span>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="dark:!bg-gray-600 !bg-gray-400 !w-3 !h-3 !-bottom-1.5 transition-colors duration-200 group-hover:!bg-purple-500"
        />
      </div>

      {showMenu && (onBranchCreate || onBranchSwitch) && (
        <div className="absolute z-10 mt-2 w-56 rounded-lg dark:bg-gray-900 bg-white shadow-lg ring-1 dark:ring-white/5 ring-black/5 dark:border-gray-800 border-gray-100">
          <div className="py-1.5" role="menu">
            {onBranchCreate && (
              <button
                className="w-full text-left px-4 py-2.5 text-sm dark:text-gray-300 text-gray-700 dark:hover:bg-purple-900 hover:bg-purple-50 flex items-center gap-2 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onBranchCreate();
                  setShowMenu(false);
                }}
              >
                <GitBranch className="h-4 w-4 dark:text-purple-400 text-purple-600" />
                <span>Create Branch Here</span>
                <ChevronRight className="h-3.5 w-3.5 ml-auto dark:text-gray-500 text-gray-400" />
              </button>
            )}
            {onBranchSwitch && (
              <button
                className="w-full text-left px-4 py-2.5 text-sm dark:text-gray-300 text-gray-700 dark:hover:bg-purple-900 hover:bg-purple-50 flex items-center gap-2 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onBranchSwitch();
                  setShowMenu(false);
                }}
              >
                <GitCommit className="h-4 w-4 dark:text-purple-400 text-purple-600" />
                <span>Switch to Branch</span>
                <ChevronRight className="h-3.5 w-3.5 ml-auto dark:text-gray-500 text-gray-400" />
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
