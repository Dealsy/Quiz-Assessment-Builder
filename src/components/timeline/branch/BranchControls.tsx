import { Branch } from "@/types/version";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitBranch, GitMerge, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BranchControlsProps = {
  branches: Branch[];
  activeBranchId: string;
  onBranchSwitch: (branchId: string) => void;
  isLoading?: boolean;
};

export default function BranchControls({
  branches,
  activeBranchId,
  onBranchSwitch,
  isLoading = false,
}: BranchControlsProps) {
  const activeBranch = branches.find((b) => b.id === activeBranchId);

  return (
    <div className="flex items-center gap-4 p-4 border-b bg-white/50 backdrop-blur-sm sticky top-0">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
        ) : (
          <GitBranch className="h-4 w-4 text-gray-500" />
        )}
        <Select
          value={activeBranchId}
          onValueChange={onBranchSwitch}
          disabled={isLoading}
        >
          <SelectTrigger className={cn("w-[180px]", isLoading && "opacity-50")}>
            <SelectValue>{activeBranch?.name || "Select Branch"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem
                key={branch.id}
                value={branch.id}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  {branch.isMain ? (
                    <GitMerge className="h-4 w-4 text-blue-500" />
                  ) : (
                    <GitBranch className="h-4 w-4 text-gray-500" />
                  )}
                  <span>{branch.name}</span>
                  {branch.isMain && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      main
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {activeBranch && !activeBranch.isMain && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Created from:</span>
            <span className="font-medium">
              {branches.find((b) => b.id === activeBranch.parentBranchId)
                ?.name || "Unknown"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500 border-l pl-4">
          <span>
            {branches.length} {branches.length === 1 ? "branch" : "branches"}
          </span>
        </div>
      </div>
    </div>
  );
}
