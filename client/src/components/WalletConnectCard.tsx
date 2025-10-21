import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Copy, Check } from "lucide-react";
import { useState } from "react";

interface WalletConnectCardProps {
  isConnected: boolean;
  isConnecting: boolean;
  smartAccountAddress?: string;
  onConnect: () => void;
}

export function WalletConnectCard({
  isConnected,
  isConnecting,
  smartAccountAddress,
  onConnect,
}: WalletConnectCardProps) {
  const [copied, setCopied] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = () => {
    if (smartAccountAddress) {
      navigator.clipboard.writeText(smartAccountAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card
      className="fixed top-8 left-8 z-50 p-4 backdrop-blur-md bg-card/90 border-2 border-border shadow-lg"
      data-testid="card-wallet"
    >
      {!isConnected ? (
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          variant="default"
          className="text-xs h-auto py-3 px-4 font-mono"
          data-testid="button-connect-wallet"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <div className="flex flex-col gap-2" data-testid="container-wallet-connected">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" data-testid="status-connected" />
            <span className="text-xs font-mono text-muted-foreground">Connected</span>
          </div>
          {smartAccountAddress && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-foreground" data-testid="text-wallet-address">
                {truncateAddress(smartAccountAddress)}
              </span>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-accent transition-colors"
                data-testid="button-copy-address"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
