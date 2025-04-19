import {
  EditorContent,
  useEditor,
  FloatingMenu,
  BubbleMenu,
  Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { WordCount } from "./word-count";
import Toolbar from "./toolbar";
import { useVersionStore } from "../../store/versionStore";
import { format } from "date-fns";
import { useCallback } from "react";
import { Transaction } from "@tiptap/pm/state";
import { Step } from "prosemirror-transform";

type TiptapProps = {
  editor?: ReturnType<typeof useEditor>;
};

export default function Tiptap({ editor: externalEditor }: TiptapProps) {
  const {
    currentVersion,
    lastSaved,
    isDirty,
    saveVersion,
    getVersionContent,
    hasContent,
    isInitialEditing,
    applyStep,
  } = useVersionStore();

  const handleEditorUpdate = useCallback(
    ({ editor, transaction }: { editor: Editor; transaction: Transaction }) => {
      // Only track and save content changes
      if (transaction.docChanged) {
        transaction.steps.forEach((step: Step) => {
          applyStep(step);
        });
        saveVersion(editor.state);
      }
    },
    [applyStep, saveVersion]
  );

  const internalEditor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable history as we're using our own version control
      }),
    ],
    content: "<p>Hello World!</p>",
    onUpdate: handleEditorUpdate,
  });

  const editor = externalEditor || internalEditor;

  if (!editor) {
    return null;
  }

  const versionResult = getVersionContent(currentVersion);
  const hasError = versionResult.error !== undefined;

  return (
    <div className="p-6 max-w-4xl mx-auto mt-24 border-2 rounded-lg shadow-lg">
      <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Toolbar editor={editor} />
          {hasContent && (
            <div className="flex items-center gap-4 text-sm">
              {!isInitialEditing && (
                <span className="text-gray-500 dark:text-gray-400">
                  Version {currentVersion}
                </span>
              )}
              <span className="text-gray-300 dark:text-gray-600">•</span>
              {isDirty ? (
                <span className="text-gray-500 dark:text-gray-400">
                  Saving...
                </span>
              ) : !isInitialEditing && hasError ? (
                <span className="text-red-500 dark:text-red-400">
                  {versionResult.error?.message}
                </span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  Last saved: {format(lastSaved, "h:mm:ss a")}
                </span>
              )}
            </div>
          )}
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
