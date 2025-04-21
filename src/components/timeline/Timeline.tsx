import { useEditor } from "@tiptap/react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Slider } from "../ui/slider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EditorContent } from "@tiptap/react";
import { useCallback, useEffect, useMemo } from "react";
import { WordCount } from "../tiptap/word-count";
import { useVersionStore } from "@/store/versionStore";
import { StarterKit } from "@tiptap/starter-kit";
import BranchView from "./branch/BranchView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { GitBranch } from "lucide-react";

type TimelineProps = {
  editor: ReturnType<typeof useEditor>;
};

export default function Timeline({ editor }: TimelineProps) {
  const {
    currentVersion,
    getVersionContent,
    setCurrentVersion,
    hasContent,
    isInitialEditing,
    getBranchVersions,
    createBranch,
    switchBranch,
    getActiveBranch,
    branches,
    activeBranchId,
  } = useVersionStore();

  const minVersion = 1;

  // Get active branch
  const activeBranch = useMemo(() => {
    return getActiveBranch();
  }, [getActiveBranch, activeBranchId]);

  // Get all branches including main
  const allBranches = useMemo(() => {
    const branchList = Array.from(branches.values());
    const mainBranch = branchList.find((b) => b.isMain);
    const otherBranches = branchList.filter((b) => !b.isMain);

    // Ensure main branch is always first in the list
    return mainBranch ? [mainBranch, ...otherBranches] : otherBranches;
  }, [branches]);

  // Calculate min and max versions for the current branch
  const branchVersionRange = useMemo(() => {
    if (!activeBranch) {
      return { min: minVersion, max: minVersion };
    }

    // Get versions for the current branch
    const result = getBranchVersions(activeBranch.id);
    if (!result.data) {
      return { min: minVersion, max: minVersion };
    }

    // Get all version numbers including parent branch versions
    const versions = result.data.map(
      (bv) => Number(bv.version.parentVersion || 0) + 1
    );

    return {
      min: Math.min(...versions, minVersion),
      max: Math.max(...versions, minVersion),
    };
  }, [getBranchVersions, activeBranch, minVersion]);

  const timelineEditor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
    ],
    editable: false,
  });

  const handleVersionChange = useCallback(
    (version: number) => {
      if (
        version < branchVersionRange.min ||
        version > branchVersionRange.max
      ) {
        return;
      }

      const result = setCurrentVersion(version);
      if (result.error) {
        console.error("Version change error:", result.error.message);
        return;
      }

      const content = getVersionContent(version);
      if (content.error) {
        console.error("Content fetch error:", content.error.message);
        return;
      }

      if (content.data && timelineEditor) {
        timelineEditor.commands.setContent(content.data);
      }
    },
    [getVersionContent, setCurrentVersion, timelineEditor, branchVersionRange]
  );

  // Determine if navigation is possible
  const canNavigatePrevious = currentVersion > branchVersionRange.min;
  const canNavigateNext = currentVersion < branchVersionRange.max;

  const handlePreviousVersion = useCallback(() => {
    if (canNavigatePrevious) {
      handleVersionChange(currentVersion - 1);
    }
  }, [currentVersion, canNavigatePrevious, handleVersionChange]);

  const handleNextVersion = useCallback(() => {
    if (canNavigateNext) {
      handleVersionChange(currentVersion + 1);
    }
  }, [currentVersion, canNavigateNext, handleVersionChange]);

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const version = values[0];
      if (
        version >= branchVersionRange.min &&
        version <= branchVersionRange.max
      ) {
        handleVersionChange(version);
      }
    },
    [handleVersionChange, branchVersionRange]
  );

  // Handle branch switching
  const handleBranchSwitch = useCallback(
    (branchId: string) => {
      console.log("Switching to branch:", branchId);

      // Ensure we have a valid branch ID
      if (!branchId) {
        console.error("Invalid branch ID");
        return;
      }

      const branch = branches.get(branchId);
      if (!branch) {
        console.error("Branch not found:", branchId);
        return;
      }

      // Switch branch first
      const result = switchBranch(branchId);
      if (result.error) {
        console.error("Branch switch error:", result.error.message);
        return;
      }

      // Get the branch's versions to determine available versions
      const branchVersionsResult = getBranchVersions(branchId);
      if (
        !branchVersionsResult.data ||
        branchVersionsResult.data.length === 0
      ) {
        console.error("No versions found for branch:", branchId);
        return;
      }

      // Get the version content and update the timeline editor
      const targetVersion = Number(branch.currentVersionId);
      const content = getVersionContent(targetVersion);
      if (content.error) {
        console.error("Content fetch error:", content.error.message);
        return;
      }

      if (content.data && timelineEditor) {
        timelineEditor.commands.setContent(content.data);
      }
    },
    [
      switchBranch,
      branches,
      getBranchVersions,
      getVersionContent,
      timelineEditor,
    ]
  );

  // Handle branch creation
  const handleBranchCreate = useCallback(
    (parentVersionId: string) => {
      const result = createBranch(parentVersionId);
      if (result.error) {
        console.error("Branch creation error:", result.error.message);
        return;
      }

      // The version store will automatically switch to the new branch
      if (result.data) {
        const newBranch = result.data;
        console.log("Created new branch:", newBranch);

        // Get the version content and update the timeline editor
        const content = getVersionContent(Number(parentVersionId));
        if (content.error) {
          console.error("Content fetch error:", content.error.message);
          return;
        }

        if (content.data && timelineEditor) {
          timelineEditor.commands.setContent(content.data);
        }
      }
    },
    [createBranch, getVersionContent, timelineEditor]
  );

  // Initialize with current version content
  useEffect(() => {
    if (timelineEditor && hasContent && !isInitialEditing) {
      const content = getVersionContent(currentVersion);
      if (content.data) {
        timelineEditor.commands.setContent(content.data);
      }
    }
  }, [
    timelineEditor,
    currentVersion,
    getVersionContent,
    hasContent,
    isInitialEditing,
  ]);

  if (!editor || !timelineEditor) {
    return null;
  }

  if (!hasContent || isInitialEditing) {
    return (
      <div className="p-6 mx-auto h-[calc(100vh-8rem)]">
        <Card className="h-full flex items-center justify-center text-muted-foreground">
          No version history available yet. Make some changes and save to start
          tracking versions.
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6  mx-auto h-[calc(100vh-8rem)]">
      <Card className="h-full">
        <Tabs defaultValue="timeline" className="h-full flex flex-col">
          <TabsList className="w-full justify-start mb-2 bg-transparent py-10">
            <TabsTrigger
              value="timeline"
              className="py-10 border-none text-2xl font-medium [data-state=inactive]:text-black/50"
            >
              Timeline View
            </TabsTrigger>
            <TabsTrigger
              value="branch"
              className="py-10 border-none text-2xl font-medium [data-state=inactive]:text-black/50"
            >
              Branch View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 px-4">
            <div className="relative h-full flex flex-col">
              {/* Navigation Buttons */}
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 cursor-pointer active:scale-110"
                  onClick={handlePreviousVersion}
                  disabled={!canNavigatePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 cursor-pointer active:scale-110"
                  onClick={handleNextVersion}
                  disabled={!canNavigateNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              {/* Branch Controls */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                  <Select
                    value={activeBranchId}
                    onValueChange={handleBranchSwitch}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          {activeBranch?.name || "Select branch"}
                          {activeBranch?.isMain && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
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
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
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
                    onClick={() =>
                      handleBranchCreate(currentVersion.toString())
                    }
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Create Branch
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Version {currentVersion}
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 border rounded-lg mx-12 min-h-128 overflow-auto">
                <EditorContent
                  editor={timelineEditor}
                  className="prose dark:prose-invert max-w-none h-full p-4"
                />
              </div>

              {/* Timeline Controls */}
              <div className="h-24 px-12 flex flex-col justify-center">
                <Slider
                  value={[currentVersion]}
                  min={branchVersionRange.min}
                  max={branchVersionRange.max}
                  step={1}
                  className="mb-4"
                  onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>v {currentVersion}</div>
                  <WordCount editor={timelineEditor} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branch" className="flex-1 px-4">
            <BranchView
              onBranchCreate={handleBranchCreate}
              onBranchSwitch={handleBranchSwitch}
              onVersionSelect={(versionId) =>
                handleVersionChange(Number(versionId))
              }
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
