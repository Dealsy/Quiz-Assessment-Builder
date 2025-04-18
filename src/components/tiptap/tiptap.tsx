import {
  EditorContent,
  useEditor,
  Editor,
  FloatingMenu,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { WordCount } from "./word-count";
import Toolbar from "./toolbar";
const extensions = [StarterKit];

const content = "<p>Hello World!</p>";

const EditorToolbar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  return <Toolbar editor={editor} />;
};

const Tiptap = () => {
  const editor = useEditor({
    extensions,
    content,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="relative">
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none p-4 min-h-[200px]"
        />
        <FloatingMenu editor={editor}>
          <EditorToolbar editor={editor} />
        </FloatingMenu>
        <BubbleMenu editor={editor}>
          <EditorToolbar editor={editor} />
        </BubbleMenu>
      </div>
      <WordCount editor={editor} />
    </div>
  );
};

export default Tiptap;
