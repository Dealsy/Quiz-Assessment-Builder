import { useEditor } from "@tiptap/react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EditorContent } from "@tiptap/react";
import { useCallback, useEffect, useMemo } from "react";
import { useVersionStore } from "@/store/versionStore";
import BranchView from "./branch/BranchView";
import TimelineBranchControls from "./TimelineBranchControls";
import TimelineNavigation from "./TimelineNavigation";
import TimelineControls from "./TimelineControls";
import {
  calculateBranchVersionRange,
  handleVersionContentChange,
  handleVersionChange,
  handleSliderChange,
} from "@/utils/version";
import {
  handleBranchCreate,
  handleBranchSwitch,
  getAllBranches,
} from "@/utils/branch";
import { StarterKit } from "@tiptap/starter-kit";

type TimelineProps = {
  editor: ReturnType<typeof useEditor>;
  setShowTimeline: (show: boolean) => void;
};

export default function Timeline({ editor, setShowTimeline }: TimelineProps) {
  const {
    currentVersion,
    getVersionContent,
    setCurrentVersion,
    hasContent,
    isInitialEditing,
    getBranchVersions,
    createBranch,
    switchBranch,
    branches,
    activeBranchId,
  } = useVersionStore();

  const minVersion = 1;

  // Get active branch
  const activeBranch = useVersionStore(
    useCallback((state) => state.branches.get(state.activeBranchId), [])
  );

  // Get all branches including main
  const allBranches = useMemo(() => getAllBranches(branches), [branches]);

  const timelineEditor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
    ],
    editable: false,
  });

  // Calculate branch version range
  const branchVersionRange = useMemo(() => {
    if (!activeBranch) {
      return { min: minVersion, max: minVersion };
    }

    const result = getBranchVersions(activeBranch.id);
    if (!result.data) {
      return { min: minVersion, max: minVersion };
    }

    return calculateBranchVersionRange(
      result.data.map((bv) => bv.version),
      minVersion
    );
  }, [getBranchVersions, activeBranch, minVersion]);

  // Determine if navigation is possible
  const canNavigatePrevious = currentVersion > branchVersionRange.min;
  const canNavigateNext = currentVersion < branchVersionRange.max;

  const handlePreviousVersion = useCallback(() => {
    if (canNavigatePrevious) {
      handleVersionChange(
        currentVersion - 1,
        branchVersionRange,
        timelineEditor,
        setCurrentVersion,
        getVersionContent
      );
    }
  }, [
    currentVersion,
    canNavigatePrevious,
    branchVersionRange,
    timelineEditor,
    setCurrentVersion,
    getVersionContent,
  ]);

  const handleNextVersion = useCallback(() => {
    if (canNavigateNext) {
      handleVersionChange(
        currentVersion + 1,
        branchVersionRange,
        timelineEditor,
        setCurrentVersion,
        getVersionContent
      );
    }
  }, [
    currentVersion,
    canNavigateNext,
    branchVersionRange,
    timelineEditor,
    setCurrentVersion,
    getVersionContent,
  ]);

  // Initialize with current version content
  useEffect(() => {
    if (timelineEditor && hasContent && !isInitialEditing) {
      handleVersionContentChange(
        currentVersion,
        timelineEditor,
        getVersionContent
      );
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
    <div className="p-6 mx-auto h-[calc(100vh-8rem)]">
      <Card className="h-full">
        <Tabs defaultValue="timeline" className="h-full flex flex-col">
          <TabsList className="w-full justify-start mb-2 bg-transparent py-10">
            <TabsTrigger
              value="timeline"
              className="py-10 border-none text-2xl font-medium data-[state=inactive]:text-muted-foreground/60 data-[state=active]:text-foreground"
            >
              Timeline View
            </TabsTrigger>
            <TabsTrigger
              value="branch"
              className="py-10 border-none text-2xl font-medium data-[state=inactive]:text-muted-foreground/60 data-[state=active]:text-foreground"
            >
              Branch View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 px-4">
            <div className="relative h-full flex flex-col">
              <TimelineNavigation
                onPrevious={handlePreviousVersion}
                onNext={handleNextVersion}
                canNavigatePrevious={canNavigatePrevious}
                canNavigateNext={canNavigateNext}
              />

              <TimelineBranchControls
                activeBranch={activeBranch}
                activeBranchId={activeBranchId}
                allBranches={allBranches}
                currentVersion={currentVersion}
                onBranchSwitch={(branchId) => {
                  handleBranchSwitch(
                    branchId,
                    branches,
                    timelineEditor,
                    switchBranch,
                    getBranchVersions,
                    getVersionContent
                  );
                }}
                onBranchCreate={(parentVersionId) => {
                  handleBranchCreate(
                    parentVersionId,
                    timelineEditor,
                    createBranch,
                    getVersionContent
                  );
                }}
              />

              <div className="flex-1 border rounded-lg mx-12 min-h-128 overflow-auto my-5">
                <EditorContent
                  editor={timelineEditor}
                  className="prose dark:prose-invert max-w-none h-full p-4"
                />
              </div>

              <TimelineControls
                currentVersion={currentVersion}
                minVersion={branchVersionRange.min}
                maxVersion={branchVersionRange.max}
                onVersionChange={(values) =>
                  handleSliderChange(
                    values,
                    branchVersionRange,
                    timelineEditor,
                    setCurrentVersion,
                    getVersionContent
                  )
                }
                editor={timelineEditor}
              />
            </div>
          </TabsContent>

          <TabsContent value="branch" className="flex-1 px-4">
            <BranchView
              onVersionSelect={(versionId) => {
                handleVersionChange(
                  Number(versionId),
                  branchVersionRange,
                  timelineEditor,
                  setCurrentVersion,
                  getVersionContent
                );
                const branchVersions = getBranchVersions(activeBranchId);
                if (branchVersions.data) {
                  const version = branchVersions.data.find(
                    (bv) => bv.version.parentVersion === versionId
                  );
                  if (version) {
                    handleBranchSwitch(
                      version.branch.id,
                      branches,
                      timelineEditor,
                      switchBranch,
                      getBranchVersions,
                      getVersionContent
                    );
                  }
                }
              }}
              onEdit={() => {
                setShowTimeline(false);
              }}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
