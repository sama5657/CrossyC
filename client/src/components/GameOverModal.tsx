import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, ExternalLink } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  transactionHash?: string;
  explorerUrl?: string;
  onRetry: () => void;
}

export function GameOverModal({
  isOpen,
  score,
  transactionHash,
  explorerUrl,
  onRetry,
}: GameOverModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md backdrop-blur-md bg-card/95 border-2 border-destructive"
        data-testid="modal-game-over"
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-destructive" data-testid="icon-game-over" />
          </div>
          <DialogTitle className="text-center font-sans text-2xl" data-testid="text-game-over-title">
            Game Over!
          </DialogTitle>
          <DialogDescription className="text-center text-sm font-mono">
            You've been hit by a vehicle!
          </DialogDescription>
        </DialogHeader>

        <div className="bg-primary/20 p-6 rounded-md border-2 border-primary" data-testid="container-final-score">
          <p className="text-xs text-muted-foreground mb-2 font-mono text-center">FINAL SCORE</p>
          <p className="text-5xl font-sans text-primary text-center" data-testid="text-final-score">
            {score}
          </p>
        </div>

        {transactionHash && (
          <div className="bg-muted/50 p-3 rounded-md border border-border" data-testid="container-score-tx">
            <p className="text-xs text-muted-foreground mb-1 font-mono">Score saved on-chain</p>
            <p className="text-xs font-mono text-primary" data-testid="text-score-saved">
              ✓ Transaction confirmed
            </p>
          </div>
        )}

        <DialogFooter className="sm:justify-center gap-2 flex-col sm:flex-row">
          <Button
            variant="destructive"
            onClick={onRetry}
            className="text-xs font-mono w-full sm:w-auto"
            data-testid="button-retry"
          >
            Retry
          </Button>
          {explorerUrl && transactionHash && (
            <Button
              variant="outline"
              onClick={() => window.open(explorerUrl, "_blank")}
              className="text-xs font-mono w-full sm:w-auto"
              data-testid="button-view-score-explorer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
