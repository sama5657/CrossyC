import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  http, 
  type Address,
} from "viem";
import { MONAD_TESTNET, CONTRACT_ADDRESS, SCORE_STORE_ABI, publicClient } from "./web3";

export async function connectWalletSimple(): Promise<Address> {
  if (typeof window.ethereum === "undefined") {
    const error = new Error("MetaMask not installed");
    error.name = "MetaMaskNotInstalledError";
    throw error;
  }

  let accounts: Address[] = [];
  try {
    accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    }) as Address[];
  } catch (error: any) {
    if (error?.code === 4001) {
      const cancelError = new Error("User rejected connection");
      cancelError.name = "UserRejectedError";
      throw cancelError;
    }
    throw error;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${MONAD_TESTNET.id.toString(16)}` }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${MONAD_TESTNET.id.toString(16)}`,
            chainName: MONAD_TESTNET.name,
            nativeCurrency: MONAD_TESTNET.nativeCurrency,
            rpcUrls: [MONAD_TESTNET.rpcUrls.default.http[0]],
            blockExplorerUrls: [MONAD_TESTNET.blockExplorers.default.url],
          },
        ],
      });
    }
  }

  console.log("Connected to wallet (Simple mode):", accounts[0]);
  return accounts[0];
}

export async function saveScoreToBlockchainSimple(score: number): Promise<string> {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Contract not deployed. Please deploy the ScoreStore contract and set VITE_CONTRACT_ADDRESS environment variable.");
  }

  const walletClient = createWalletClient({
    chain: MONAD_TESTNET,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.getAddresses();

  try {
    console.log("Submitting score via regular transaction:", account);
    console.log("Score:", score);

    const hash = await walletClient.writeContract({
      account,
      address: CONTRACT_ADDRESS,
      abi: SCORE_STORE_ABI,
      functionName: "saveScore",
      args: [BigInt(score)],
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...");

    await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    console.log("Transaction confirmed:", hash);
    return hash;
  } catch (error: any) {
    console.error("Error saving score:", error);
    
    if (error?.code === 4001 || error?.message?.includes("User rejected")) {
      const userRejectionError = new Error("User rejected");
      (userRejectionError as any).code = 4001;
      throw userRejectionError;
    }
    
    throw error;
  }
}
