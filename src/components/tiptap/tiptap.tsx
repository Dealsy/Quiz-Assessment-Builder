import { useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { WordCount } from "./word-count";
import Toolbar from "./toolbar";
import { useVersionStore } from "../../store/versionStore";
import { useCallback, useEffect } from "react";
import { Transaction } from "@tiptap/pm/state";
import { Step } from "prosemirror-transform";
import EditorContent from "./EditorContent";
import VersionStatus from "./VersionStatus";

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
        history: false,
      }),
    ],
    content: "<p>Hello World!</p>",
    onUpdate: handleEditorUpdate,
  });

  const editor = externalEditor || internalEditor;

  // Sync editor content with current version
  useEffect(() => {
    if (editor && hasContent && !isInitialEditing) {
      const content = getVersionContent(currentVersion);
      if (content.data) {
        editor.commands.setContent(content.data);
      }
    }
  }, [editor, currentVersion, getVersionContent, hasContent, isInitialEditing]);

  if (!editor) {
    return null;
  }

  const versionResult = getVersionContent(currentVersion);
  const hasError = versionResult.error !== undefined;
  const showVersionUI = hasContent || isDirty || editor.getText().length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto mt-24 border-2 rounded-lg shadow-lg">
      <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Toolbar editor={editor} />
          {showVersionUI && (
            <VersionStatus
              currentVersion={currentVersion}
              lastSaved={lastSaved}
              isDirty={isDirty}
              hasError={hasError}
              isInitialEditing={isInitialEditing}
              errorMessage={versionResult.error?.message}
            />
          )}
        </div>
        <EditorContent editor={editor} />
        <div className="flex items-center justify-between p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <WordCount editor={editor} />
        </div>
      </div>
    </div>
  );
}
