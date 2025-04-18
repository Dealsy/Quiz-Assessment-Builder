import { useEditor } from "@tiptap/react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Slider } from "../ui/slider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EditorContent } from "@tiptap/react";
import { useState } from "react";
import { WordCount } from "../tiptap/word-count";

type TimelineProps = {
  editor: ReturnType<typeof useEditor>;
};

export default function Timeline({ editor }: TimelineProps) {
  const [version] = useState(12); // Example version number

  if (!editor) {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <Card className="h-full">
        <Tabs defaultValue="timeline" className="h-full flex flex-col">
          <TabsList className="w-full justify-start mb-2 bg-transparent py-10">
            <TabsTrigger
              value="timeline"
              className="py-10 border-none text-2xl font-medium [data-state=inactive]:text-black/50"
            >
              Timeline View
            </TabsTrigger>
            <TabsTrigger
              value="branch"
              className="py-10 border-none text-2xl font-medium [data-state=inactive]:text-black/50"
            >
              Branch View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 px-4">
            <div className="relative h-full flex flex-col">
              {/* Navigation Buttons */}
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 cursor-pointer active:scale-110"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 cursor-pointer active:scale-110"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              {/* Editor Content */}
              <div className="flex-1 border rounded-lg mx-12 min-h-128 overflow-auto">
                <EditorContent
                  editor={editor}
                  className="prose dark:prose-invert max-w-none h-full p-4"
                />
              </div>

              {/* Timeline Controls */}
              <div className="h-24 px-12 flex flex-col justify-center">
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>v {version}</div>
                  <WordCount editor={editor} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branch" className="flex-1">
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Branch view coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
