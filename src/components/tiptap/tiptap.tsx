import {
  EditorContent,
  useEditor,
  FloatingMenu,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { WordCount } from "./word-count";
import Toolbar from "./toolbar";
const extensions = [StarterKit];

const content = "<p>Hello World!</p>";

const Tiptap = () => {
  const editor = useEditor({
    extensions,
    content,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto mt-24 border-2 rounded-lg shadow-lg">
      <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
        <Toolbar editor={editor} />
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
        <WordCount editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
