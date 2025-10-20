import { useEffect, useRef, useState, useCallback } from "react";
import { WalletConnectCard } from "@/components/WalletConnectCard";
import { NetworkBadge } from "@/components/NetworkBadge";
import { TransactionModal } from "@/components/TransactionModal";
import { GameControls } from "@/components/GameControls";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { GameOverModal } from "@/components/GameOverModal";
import { Toaster } from "@/components/ui/toaster";
import type { WalletState, TransactionData } from "@shared/schema";
import { initializeGame } from "@/lib/game";
import { connectWallet, saveScoreToBlockchain, getExplorerUrl } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const canvasRef = useRef<HTMLDivElement>(null);
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
    if (!canvasRef.current) return;

    const game = initializeGame(
      canvasRef.current,
      (newScore) => setScore(newScore),
      () => setGameOver(true)
    );

    gameInstanceRef.current = game;

    return () => {
      if (canvasRef.current) {
        canvasRef.current.innerHTML = "";
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true }));
    setWalletError(undefined);

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

      setWalletError(errorMessage);
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
      console.error("Failed to save score:", error);
      
      let errorMessage = "Failed to save score on-chain";
      if (error?.message?.includes("Contract not deployed")) {
        errorMessage = "Smart contract not deployed. Please deploy the contract first and set VITE_CONTRACT_ADDRESS in .env file.";
      } else if (error?.message?.includes("Lower score")) {
        errorMessage = "Your score must be higher than your previous best score to save on-chain.";
      }
      
      setTransactionData({
        status: "failed",
        error: errorMessage,
      });
    }
  };

  useEffect(() => {
    if (gameOver && walletState.isConnected && score > 0) {
      handleSaveScore();
    }
  }, [gameOver]);

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
            <h1 className="text-4xl font-bold text-primary mb-4">Crossy Chain</h1>
            <p className="text-lg text-muted-foreground">Connect your wallet to start playing</p>
          </div>
        </div>
      )}

      <WalletConnectCard
        isConnected={walletState.isConnected}
        isConnecting={walletState.isConnecting}
        smartAccountAddress={walletState.smartAccountAddress}
        onConnect={handleConnectWallet}
        error={walletError}
      />

      <NetworkBadge isConnected={walletState.isConnected} />

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
        onRetry={handleRetry}
      />
    </div>
  );
}
