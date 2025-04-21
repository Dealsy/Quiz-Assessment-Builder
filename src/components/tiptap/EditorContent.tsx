import { Editor, EditorContent as TiptapContent } from "@tiptap/react";
import EditorBubbleMenu from "./EditorBubbleMenu";
import EditorFloatingMenu from "./EditorFloatingMenu";

type EditorContentProps = {
  editor: Editor;
};

export default function EditorContent({ editor }: EditorContentProps) {
  return (
    <div className="relative">
      <TiptapContent
        editor={editor}
        className="prose dark:prose-invert max-w-none p-4 min-h-[400px]"
      />
      <EditorFloatingMenu editor={editor} />
      <EditorBubbleMenu editor={editor} />
    </div>
  );
}
