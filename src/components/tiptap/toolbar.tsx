import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Heading1, Heading2, Heading3, Type } from "lucide-react";
import { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor;
}

export default function Toolbar({ editor }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 border-b dark:border-gray-700">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("heading", { level: 1 }) && "bg-accent"
        )}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("heading", { level: 2 }) && "bg-accent"
        )}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("heading", { level: 3 }) && "bg-accent"
        )}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("paragraph") && "bg-accent"
        )}
      >
        <Type className="h-4 w-4" />
      </Button>
    </div>
  );
}
