import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { WalletConnectCard } from "@/components/WalletConnectCard";
import { NetworkBadge } from "@/components/NetworkBadge";
import { TransactionModal } from "@/components/TransactionModal";
import { GameControls } from "@/components/GameControls";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { GameOverModal } from "@/components/GameOverModal";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import type { WalletState, TransactionData } from "@shared/schema";
import { initializeGame } from "@/lib/game";
import { connectWallet, saveScoreToBlockchain, getExplorerUrl } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData>({
    status: "idle",
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !walletState.isConnected) return;

    const initGame = async () => {
      // Wait for Three.js to load
      let attempts = 0;
      while (!window.THREE && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.THREE) {
        console.error("Three.js failed to load");
        return;
      }

      const game = initializeGame(
        canvasRef.current!,
        (newScore) => setScore(newScore),
        () => {
          if (game) {
            game.stop();
          }
          setGameOver(true);
        }
      );

      gameInstanceRef.current = game;
    };

    initGame();

    return () => {
      if (canvasRef.current) {
        canvasRef.current.innerHTML = "";
      }
    };
  }, [walletState.isConnected]);

  const handleConnectWallet = async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true }));

    try {
      const address = await connectWallet();
      setWalletState({
        isConnected: true,
        isConnecting: false,
        smartAccountAddress: address,
        chainId: 10143,
      });
    } catch (error) {
      let errorMessage = "Failed to connect wallet";

      if (error instanceof Error) {
        if (error.name === "MetaMaskNotInstalledError" || error.message.includes("MetaMask not installed")) {
          errorMessage = "MetaMask not installed. Please install MetaMask browser extension to play.";
        } else if (error.name === "UserRejectedError" || error.message.includes("User rejected")) {
          errorMessage = "Connection request was rejected. Please try again.";
        } else if (error.message.includes("Chain")) {
          errorMessage = "Failed to switch to Monad testnet. Please try again.";
        } else {
          errorMessage = "Failed to connect wallet. Please try again.";
        }
      }

      toast({
        title: "Wallet Connection Error",
        description: errorMessage,
        variant: "destructive",
      });

      setWalletState({
        isConnected: false,
        isConnecting: false,
      });
    }
  };

  const handleMove = useCallback((direction: "forward" | "backward" | "left" | "right") => {
    gameInstanceRef.current?.move(direction);
  }, []);

  const handleRetry = () => {
    setGameOver(false);
    setScore(0);
    setTransactionData({ status: "idle" });
    gameInstanceRef.current?.retry();
  };

  const handleSaveScore = async () => {
    if (!walletState.isConnected || score === 0) return;

    setShowTransactionModal(true);
    setTransactionData({ status: "pending" });

    try {
      const txHash = await saveScoreToBlockchain(score);
      setTransactionData({
        status: "success",
        hash: txHash,
        explorerUrl: getExplorerUrl(txHash),
      });
    } catch (error: any) {
      let errorMessage = "Failed to save score on-chain";
      let isUserRejection = false;

      if (error?.code === 4001 || error?.message?.includes("User rejected")) {
        errorMessage = "Transaction rejected. Your score was not saved.";
        isUserRejection = true;
      } else if (error?.name === "InsufficientFundsError" || error?.message?.includes("INSUFFICIENT_FUNDS")) {
        const address = error.message.split(":")[1] || walletState.smartAccountAddress;
        errorMessage = `Your Smart Account needs MON tokens to pay for gas fees.\n\nSmart Account: ${address}\n\nPlease send some MON tokens from your MetaMask wallet to this Smart Account address, then try again.\n\nYou can get free testnet MON from the Monad faucet.`;
      } else if (error?.message?.includes("Contract not deployed")) {
        errorMessage = "Smart contract not deployed. Please deploy the contract first and set VITE_CONTRACT_ADDRESS in .env file.";
      } else if (error?.message?.includes("Lower score")) {
        errorMessage = "Your score must be higher than your previous best score to save on-chain.";
      }

      if (isUserRejection) {
        setShowTransactionModal(false);
        toast({
          title: "Transaction Cancelled",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        setTransactionData({
          status: "failed",
          error: errorMessage,
        });
      }
    }
  };


  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {walletState.isConnected ? (
        <>
          <div ref={canvasRef} id="game-canvas" className="w-full h-full" />
          <ScoreDisplay score={score} />
          <GameControls onMove={handleMove} />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Crossy Road</h1>
            <p className="text-lg text-muted-foreground mb-2">Connect your wallet to start playing</p>
            <p className="text-xs text-muted-foreground">Use WASD Keys or Arrow Keys to Play</p>
          </div>
        </div>
      )}

      <WalletConnectCard
        isConnected={walletState.isConnected}
        isConnecting={walletState.isConnecting}
        smartAccountAddress={walletState.smartAccountAddress}
        onConnect={handleConnectWallet}
      />

      <Toaster />

      <NetworkBadge isConnected={walletState.isConnected} />

      <Button
        onClick={() => setLocation("/leaderboard")}
        variant="outline"
        size="sm"
        className="fixed bottom-8 right-8 z-40 text-xs"
        data-testid="button-view-leaderboard"
      >
        <TrendingUp className="mr-2 h-4 w-4" />
        Leaderboard
      </Button>

      <TransactionModal
        isOpen={showTransactionModal}
        status={transactionData.status}
        hash={transactionData.hash}
        error={transactionData.error}
        explorerUrl={transactionData.explorerUrl}
        onClose={() => setShowTransactionModal(false)}
      />

      <GameOverModal
        isOpen={gameOver}
        score={score}
        transactionHash={transactionData.hash}
        explorerUrl={transactionData.explorerUrl}
        isSavingScore={transactionData.status === "pending"}
        onRetry={handleRetry}
        onSubmitScore={handleSaveScore}
        onClose={handleRetry}
      />
    </div>
  );
}
