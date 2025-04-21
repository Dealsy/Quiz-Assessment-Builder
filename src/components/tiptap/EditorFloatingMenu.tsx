import { FloatingMenu, Editor } from "@tiptap/react";
import Toolbar from "./toolbar";
import { EditorState } from "@tiptap/pm/state";

type EditorFloatingMenuProps = {
  editor: Editor;
};

export default function EditorFloatingMenu({
  editor,
}: EditorFloatingMenuProps) {
  const shouldShow = ({ editor }: { state: EditorState; editor: Editor }) => {
    if (!editor.isEditable) {
      return false;
    }
    return true;
  };

  return (
    <FloatingMenu
      editor={editor}
      shouldShow={shouldShow}
      className="bg-popover border shadow-md rounded-md"
      tippyOptions={{
        placement: "top-start",
        offset: [0, 10],
      }}
    >
      <Toolbar editor={editor} />
    </FloatingMenu>
  );
}
