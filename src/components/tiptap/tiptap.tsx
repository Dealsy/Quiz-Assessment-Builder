import {
  EditorContent,
  useEditor,
  FloatingMenu,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { WordCount } from "./word-count";
import Toolbar from "./toolbar";
import { useVersionStore } from "../../store/versionStore";
import { format } from "date-fns";

type TiptapProps = {
  editor?: ReturnType<typeof useEditor>;
};

export default function Tiptap({ editor: externalEditor }: TiptapProps) {
  const { currentVersion, lastSaved, isDirty, saveVersion } = useVersionStore();

  const internalEditor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World!</p>",
    onUpdate: ({ editor }) => {
      saveVersion(editor.state);
    },
  });

  const editor = externalEditor || internalEditor;

  if (!editor) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto mt-24 border-2 rounded-lg shadow-lg">
      <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Toolbar editor={editor} />
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Version {currentVersion}</span>
            <span>•</span>
            <span>
              {isDirty ? (
                "Saving..."
              ) : (
                <>Last saved: {format(lastSaved, "h:mm:ss a")}</>
              )}
            </span>
          </div>
        </div>
        <div className="relative">
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none p-4 min-h-[400px]"
          />
          <FloatingMenu editor={editor}>
            <Toolbar editor={editor} />
          </FloatingMenu>
          <BubbleMenu editor={editor}>
            <Toolbar editor={editor} />
          </BubbleMenu>
        </div>
        <div className="flex items-center justify-between p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <WordCount editor={editor} />
        </div>
      </div>
    </div>
  );
}
