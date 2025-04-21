import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

type TimelineNavigationProps = {
  onPrevious: () => void;
  onNext: () => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
};

export default function TimelineNavigation({
  onPrevious,
  onNext,
  canNavigatePrevious,
  canNavigateNext,
}: TimelineNavigationProps) {
  return (
    <>
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 cursor-pointer active:scale-110"
          onClick={onPrevious}
          disabled={!canNavigatePrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 cursor-pointer active:scale-110"
          onClick={onNext}
          disabled={!canNavigateNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
