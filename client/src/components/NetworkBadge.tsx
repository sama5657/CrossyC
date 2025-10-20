import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

interface NetworkBadgeProps {
  isConnected: boolean;
}

export function NetworkBadge({ isConnected }: NetworkBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="fixed top-32 left-8 z-50 backdrop-blur-md bg-card/90 border-2 border-border text-xs font-mono px-3 py-2"
      data-testid="badge-network"
    >
      <Circle
        className={`mr-2 h-2 w-2 fill-current ${
          isConnected ? "text-primary" : "text-muted-foreground"
        }`}
        data-testid={isConnected ? "status-network-online" : "status-network-offline"}
      />
      Monad Testnet
    </Badge>
  );
}
