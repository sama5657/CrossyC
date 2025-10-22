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
          </div>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-destructive/10 border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-primary mb-3">Coming Soon</h2>
          <p className="text-muted-foreground">Leaderboard functionality is coming soon. Stay tuned!</p>
        </Card>
      </div>
    </div>
  );
}
