import { createPublicClient, createWalletClient, custom, http, type Address } from "viem";

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
      http: ["https://testnet-rpc.monad.xyz/"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
} as const;

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;

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

export const publicClient = createPublicClient({
  chain: MONAD_TESTNET,
  transport: http(),
});

export async function connectWallet() {
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

  return accounts[0];
}

export async function saveScoreToBlockchain(score: number): Promise<string> {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Contract not deployed. Please deploy the ScoreStore contract and set VITE_CONTRACT_ADDRESS environment variable.");
  }

  try {
    const walletClient = createWalletClient({
      chain: MONAD_TESTNET,
      transport: custom(window.ethereum),
    });

    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: SCORE_STORE_ABI,
      functionName: "saveScore",
      args: [BigInt(score)],
      account,
    });

    return hash;
  } catch (error: any) {
    if (error?.code === 4001) {
      const userRejectionError = new Error("User rejected");
      userRejectionError.code = 4001;
      throw userRejectionError;
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
      const logsResponse = await fetch("https://testnet-rpc.monad.xyz/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getLogs",
          params: [
            {
              address: CONTRACT_ADDRESS,
              topics: [SCORE_SAVED_TOPIC],
              fromBlock: `0x${fromBlock.toString(16)}`,
              toBlock: `0x${toBlock.toString(16)}`,
            },
          ],
          id: 1,
        }),
      });

      if (!logsResponse.ok) {
        throw new Error(`HTTP ${logsResponse.status}`);
      }

      const data = await logsResponse.json();

      // Check for RPC error
      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message}`);
      }

      if (!Array.isArray(data.result)) {
        return [];
      }

      return data.result || [];
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s

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

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return [];
}

export async function getTopScoresFromBlockchain(): Promise<LeaderboardEntry[]> {
  try {
    const playerScores = new Map<string, { score: number; blockNumber: number }>();

    // Get latest block number first
    const blockResponse = await fetch("https://testnet-rpc.monad.xyz/", {
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

    // Fetch logs in smaller chunks of 2500 blocks with retry logic
    // Smaller chunks reduce chances of hitting size/timeout limits
    const chunkSize = 2500;

    for (let fromBlock = 0; fromBlock <= latestBlockNumber; fromBlock += chunkSize) {
      const toBlock = Math.min(fromBlock + chunkSize - 1, latestBlockNumber);

      const logs = await fetchLogsWithRetry(fromBlock, toBlock);

      // Parse logs and get latest score for each player
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

    // Convert to array and sort by score descending
    const sorted = Array.from(playerScores.entries())
      .map(([player, data]) => ({
        player: player as Address,
        score: data.score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20

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
