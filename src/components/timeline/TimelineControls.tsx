import { Editor } from "@tiptap/react";
import { Slider } from "../ui/slider";
import { WordCount } from "../tiptap/word-count";

type TimelineControlsProps = {
  currentVersion: number;
  minVersion: number;
  maxVersion: number;
  onVersionChange: (values: number[]) => void;
  editor: Editor;
};

export default function TimelineControls({
  currentVersion,
  minVersion,
  maxVersion,
  onVersionChange,
  editor,
}: TimelineControlsProps) {
  return (
    <div className="h-24 px-12 flex flex-col justify-center">
      <Slider
        value={[currentVersion]}
        min={minVersion}
        max={maxVersion}
        step={1}
        className="mb-4"
        onValueChange={onVersionChange}
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <div>v {currentVersion}</div>
        <WordCount editor={editor} />
      </div>
    </div>
  );
}
