interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div
      className="fixed top-8 right-8 z-50 px-6 py-4 backdrop-blur-md bg-card/90 border-2 border-primary shadow-lg rounded-lg"
      data-testid="container-score"
    >
      <div className="text-xs text-muted-foreground font-mono mb-1">SCORE</div>
      <div
        className="text-4xl font-sans text-primary"
        data-testid="text-score-value"
      >
        {score}
      </div>
    </div>
  );
}
