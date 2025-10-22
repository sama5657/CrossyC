import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  http, 
  type Address,
  parseAbi,
  encodeFunctionData
} from "viem";
import { createBundlerClient, type UserOperation } from "viem/account-abstraction";
import { 
  Implementation, 
  toMetaMaskSmartAccount,
  type MetaMaskSmartAccount
} from "@metamask/delegation-toolkit";

export const MONAD_TESTNET = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/monad_testnet"],
    },
    public: {
      http: ["https://rpc.ankr.com/monad_testnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
} as const;

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "0x8c2b26d35c3c749ff1f4dc91c36a81b304ce36ee") as Address;

export const SCORE_STORE_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "_score", type: "uint256" }],
    name: "saveScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint256", name: "score", type: "uint256" },
    ],
    name: "ScoreSaved",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "_player", type: "address" }],
    name: "getScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "scores",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const MONAD_RPC_URL = import.meta.env.MONAD_RPC || "https://rpc.ankr.com/monad_testnet";

export const publicClient = createPublicClient({
  chain: MONAD_TESTNET,
  transport: http(MONAD_RPC_URL),
});

let currentSmartAccount: any = null;
let currentBundlerClient: any = null;
let currentEOAWalletClient: any = null;

export async function connectWallet(): Promise<Address> {
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

  const eoaAddress = accounts[0];

  const walletClient = createWalletClient({
    account: eoaAddress,
    chain: MONAD_TESTNET,
    transport: custom(window.ethereum),
  });

  currentEOAWalletClient = walletClient;

  console.log("Creating MetaMask Smart Account for EOA:", eoaAddress);

  try {
    currentSmartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [eoaAddress, [], [], []],
      deploySalt: "0x",
      signer: { walletClient },
    });

    const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
    
    if (!alchemyApiKey) {
      throw new Error("VITE_ALCHEMY_API_KEY is required for Smart Account transactions. Please set it in your environment variables.");
    }

    const bundlerUrl = `https://monad-testnet.g.alchemy.com/v2/${alchemyApiKey}`;
    console.log("Using Alchemy bundler for Smart Accounts on Monad testnet");

    currentBundlerClient = createBundlerClient({
      client: publicClient,
      transport: http(bundlerUrl),
    });

    console.log("Smart Account created:", currentSmartAccount.address);
    console.log("Smart Account is deployed:", await isSmartAccountDeployed(currentSmartAccount.address));

    return currentSmartAccount.address;
  } catch (error) {
    console.error("Failed to create smart account:", error);
    throw new Error("Failed to create MetaMask Smart Account. Please try again.");
  }
}

export async function isSmartAccountDeployed(address: Address): Promise<boolean> {
  try {
    const code = await publicClient.getBytecode({ address });
    return code !== undefined && code !== "0x";
  } catch {
    return false;
  }
}

export async function getSmartAccountBalance(address: Address): Promise<bigint> {
  try {
    const balance = await publicClient.getBalance({ address });
    return balance;
  } catch {
    return BigInt(0);
  }
}

export async function saveScoreToBlockchain(score: number): Promise<string> {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Contract not deployed. Please deploy the ScoreStore contract and set VITE_CONTRACT_ADDRESS environment variable.");
  }

  if (!currentSmartAccount || !currentBundlerClient) {
    throw new Error("Smart Account not initialized. Please connect wallet first.");
  }

  try {
    console.log("Submitting score via Smart Account:", currentSmartAccount.address);
    console.log("Score:", score);

    const balance = await getSmartAccountBalance(currentSmartAccount.address);
    console.log("Smart Account balance:", balance.toString(), "wei");

    if (balance === BigInt(0)) {
      const fundError = new Error(`INSUFFICIENT_FUNDS:${currentSmartAccount.address}`);
      fundError.name = "InsufficientFundsError";
      throw fundError;
    }

    const callData = encodeFunctionData({
      abi: SCORE_STORE_ABI,
      functionName: "saveScore",
      args: [BigInt(score)],
    });

    const isDeployed = await isSmartAccountDeployed(currentSmartAccount.address);
    
    if (!isDeployed) {
      console.log("Smart Account not deployed yet, will deploy with first transaction");
    }

    const gasPrice = await publicClient.getGasPrice();
    const maxFeePerGas = gasPrice * BigInt(2);
    const maxPriorityFeePerGas = gasPrice / BigInt(2);

    console.log("Attempting bundler user operation...");
    try {
      const userOperationHash = await currentBundlerClient.sendUserOperation({
        account: currentSmartAccount,
        calls: [
          {
            to: CONTRACT_ADDRESS,
            data: callData,
            value: BigInt(0),
          },
        ],
        maxFeePerGas,
        maxPriorityFeePerGas,
      });

      console.log("User operation hash:", userOperationHash);
      console.log("Waiting for bundler receipt (10s timeout)...");

      const receipt = await currentBundlerClient.waitForUserOperationReceipt({
        hash: userOperationHash,
        timeout: 10_000,
      });

      console.log("Bundler transaction confirmed:", receipt.receipt.transactionHash);
      return receipt.receipt.transactionHash;
    } catch (bundlerError: any) {
      console.warn("Bundler failed, falling back to direct transaction from EOA:", bundlerError.message);
      
      if (!currentEOAWalletClient) {
        throw new Error("Wallet client not available for fallback transaction");
      }
      
      console.log("Sending direct transaction from EOA wallet...");
      
      const txHash = await currentEOAWalletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: SCORE_STORE_ABI,
        functionName: "saveScore",
        args: [BigInt(score)],
        maxFeePerGas,
        maxPriorityFeePerGas,
      });

      console.log("Direct transaction hash:", txHash);
      console.log("Waiting for transaction confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 30_000,
      });

      console.log("Direct transaction confirmed in block:", receipt.blockNumber);
      return txHash;
    }
  } catch (error: any) {
    console.error("Error saving score:", error);
    
    if (error?.code === 4001 || error?.message?.includes("User rejected")) {
      const userRejectionError = new Error("User rejected");
      (userRejectionError as any).code = 4001;
      throw userRejectionError;
    }
    
    if (error?.name === "InsufficientFundsError" || error?.message?.includes("INSUFFICIENT_FUNDS")) {
      throw error;
    }
    
    if (error?.message?.includes("insufficient funds") || error?.message?.includes("exceeds balance")) {
      const fundError = new Error(`INSUFFICIENT_FUNDS:${currentSmartAccount.address}`);
      fundError.name = "InsufficientFundsError";
      throw fundError;
    }
    
    throw error;
  }
}

export async function getPlayerScore(playerAddress: Address): Promise<number> {
  const score = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: SCORE_STORE_ABI,
    functionName: "getScore",
    args: [playerAddress],
  });

  return Number(score);
}

export function getExplorerUrl(hash: string): string {
  return `${MONAD_TESTNET.blockExplorers.default.url}/tx/${hash}`;
}

export interface LeaderboardEntry {
  rank: number;
  player: Address;
  score: number;
  timestamp: number;
}

async function fetchLogsWithRetry(
  fromBlock: number,
  toBlock: number,
  maxRetries: number = 3
): Promise<any[]> {
  const SCORE_SAVED_TOPIC = "0xfe94b07f0f0fc9cac42c49cffaa7b7ecfcc7b97d12dc0c4b6d6b8a3b9c8d7e6f5";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const params = {
        address: CONTRACT_ADDRESS.toLowerCase(),
        topics: [SCORE_SAVED_TOPIC],
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: `0x${toBlock.toString(16)}`,
      };

      const logsResponse = await fetch("https://rpc.ankr.com/monad_testnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getLogs",
          params: [params],
          id: 1,
        }),
      });

      if (!logsResponse.ok) {
        throw new Error(`HTTP ${logsResponse.status}`);
      }

      const data = await logsResponse.json();

      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message}`);
      }

      if (!Array.isArray(data.result)) {
        return [];
      }

      return data.result || [];
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const delay = Math.pow(2, attempt) * 1000;

      if (isLastAttempt) {
        console.error(
          `Failed to fetch logs for block range ${fromBlock} - ${toBlock} after ${maxRetries} attempts:`,
          error
        );
        return [];
      }

      console.warn(
        `Attempt ${attempt + 1} failed for block range ${fromBlock} - ${toBlock}, retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return [];
}

export async function getTopScoresFromBlockchain(): Promise<LeaderboardEntry[]> {
  try {
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.warn(
        "Smart contract address not configured. Please set VITE_CONTRACT_ADDRESS environment variable."
      );
      return [];
    }

    const playerScores = new Map<string, { score: number; blockNumber: number }>();

    const blockResponse = await fetch("https://rpc.ankr.com/monad_testnet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    });

    const blockData = await blockResponse.json();
    const latestBlockNumber = parseInt(blockData.result || "0", 16);

    const chunkSize = 100;

    for (let fromBlock = 0; fromBlock <= latestBlockNumber; fromBlock += chunkSize) {
      const toBlock = Math.min(fromBlock + chunkSize - 1, latestBlockNumber);

      const logs = await fetchLogsWithRetry(fromBlock, toBlock);

      for (const log of logs) {
        if (!log.topics || log.topics.length < 2 || !log.data) continue;

        try {
          const player = `0x${log.topics[1].slice(-40)}` as Address;
          const scoreHex = log.data;
          const score = parseInt(scoreHex, 16);
          const blockNumber = parseInt(log.blockNumber, 16);

          if (isNaN(score) || isNaN(blockNumber)) continue;

          const existing = playerScores.get(player);
          if (!existing || blockNumber > existing.blockNumber) {
            playerScores.set(player, { score, blockNumber });
          }
        } catch (e) {
          console.error("Error parsing log:", e);
          continue;
        }
      }
    }

    const sorted = Array.from(playerScores.entries())
      .map(([player, data]) => ({
        player: player as Address,
        score: data.score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const entries: LeaderboardEntry[] = sorted.map((entry, index) => ({
      rank: index + 1,
      player: entry.player,
      score: entry.score,
      timestamp: Math.floor(Date.now() / 1000),
    }));

    return entries;
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

declare global {
  interface Window {
    ethereum?: any;
    THREE?: any;
  }
}
