import { Editor } from "@tiptap/react";

export const WordCount = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="text-sm text-muted-foreground px-4 py-2 border-t dark:border-gray-700">
      {wordCount} {wordCount === 1 ? "word" : "words"}
    </div>
  );
};
