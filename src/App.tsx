import { useState } from "react";
import Tiptap from "./components/tiptap/tiptap";
import Nav from "./components/ui/nav";
import Timeline from "./components/timeline/Timeline";
import { Button } from "./components/ui/button";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toaster } from "sonner";

const extensions = [StarterKit];
const content = "<p>Hello World!</p>";

export default function App() {
  const [showTimeline, setShowTimeline] = useState(false);
  const editor = useEditor({
    extensions,
    content,
  });

  if (!editor) {
    return null;
  }

  return (
    <>
      <Toaster richColors closeButton position="bottom-right" />
      <Nav />
      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          onClick={() => setShowTimeline(!showTimeline)}
        >
          {showTimeline ? "Hide Timeline" : "View Timeline"}
        </Button>
      </div>
      {showTimeline ? (
        <Timeline editor={editor} setShowTimeline={setShowTimeline} />
      ) : (
        <Tiptap />
      )}
    </>
  );
}
