import { BubbleMenu, Editor } from "@tiptap/react";
import Toolbar from "./toolbar";
import { EditorState } from "@tiptap/pm/state";

type EditorBubbleMenuProps = {
  editor: Editor;
};

export default function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const shouldShow = ({
    state,
    editor,
  }: {
    state: EditorState;
    editor: Editor;
  }) => {
    const { selection } = state;
    return selection && !selection.empty && editor.isEditable;
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      className="bg-popover border shadow-md rounded-md"
    >
      <Toolbar editor={editor} />
    </BubbleMenu>
  );
}
