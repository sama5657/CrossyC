import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface GameControlsProps {
  onMove: (direction: "forward" | "backward" | "left" | "right") => void;
}

export function GameControls({ onMove }: GameControlsProps) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      data-testid="container-game-controls"
    >
      <div className="grid grid-cols-3 grid-rows-2 gap-2 p-4 backdrop-blur-md bg-card/90 border-2 border-border rounded-lg shadow-lg">
        <Button
          variant="outline"
          size="icon"
          className="col-span-3 h-12 w-full text-xs font-mono"
          onClick={() => onMove("forward")}
          data-testid="button-move-forward"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 text-xs font-mono"
          onClick={() => onMove("left")}
          data-testid="button-move-left"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 text-xs font-mono"
          onClick={() => onMove("backward")}
          data-testid="button-move-backward"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 text-xs font-mono"
          onClick={() => onMove("right")}
          data-testid="button-move-right"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
