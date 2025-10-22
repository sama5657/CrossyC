import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>();

  return (
    <div className="relative w-full min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-xs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Top 10 Crossy Road Scores</p>
          </div>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-destructive/10 border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </Card>
        ) : scores.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No scores yet. Be the first to submit one!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {scores.map((entry, index) => (
              <Card
                key={`${entry.player}-${entry.timestamp}`}
                className="p-4 hover:bg-accent/50 transition-colors border-l-4 border-l-primary"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-[60px]">
                      <Badge
                        variant={
                          index === 0
                            ? "default"
                            : index === 1
                            ? "secondary"
                            : index === 2
                            ? "outline"
                            : "outline"
                        }
                        className={
                          index === 0
                            ? "text-lg px-3 py-1 bg-yellow-500/80 text-white"
                            : index === 1
                            ? "text-lg px-3 py-1 bg-gray-400/80 text-white"
                            : index === 2
                            ? "text-lg px-3 py-1 bg-orange-600/80 text-white"
                            : ""
                        }
                      >
                        #{index + 1}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <p className="font-mono text-sm text-foreground font-medium">
                        {truncateAddress(entry.player)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{entry.score}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
