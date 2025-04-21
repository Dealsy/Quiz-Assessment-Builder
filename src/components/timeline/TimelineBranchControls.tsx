import { GitBranch } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Branch } from "@/types/version";

type TimelineBranchControlsProps = {
  activeBranch: Branch | undefined;
  activeBranchId: string;
  allBranches: Branch[];
  currentVersion: number;
  onBranchSwitch: (branchId: string) => void;
  onBranchCreate: (parentVersionId: string) => void;
};

export default function TimelineBranchControls({
  activeBranch,
  activeBranchId,
  allBranches,
  currentVersion,
  onBranchSwitch,
  onBranchCreate,
}: TimelineBranchControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <Select value={activeBranchId} onValueChange={onBranchSwitch}>
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                {activeBranch?.name || "Select branch"}
                {activeBranch?.isMain && (
                  <span className="ml-2 text-xs bg-green-700 text-white px-1.5 py-0.5 rounded">
                    main
                  </span>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allBranches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  {branch.name}
                  {branch.isMain && (
                    <span className="ml-2 text-xs bg-green-700 text-white px-1.5 py-0.5 rounded">
                      main
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBranchCreate(currentVersion.toString())}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Create Branch
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        Version {currentVersion}
      </div>
    </div>
  );
}
