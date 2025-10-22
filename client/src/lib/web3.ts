import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  http, 
  type Address
} from "viem";
import { toMetaMaskSmartAccount, Implementation } from "@metamask/delegation-toolkit";
import { createBundlerClient } from "viem/account-abstraction";

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

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "0x0877c473BCe3aAEa4705AB5C3e24d7b0f630C956") as Address;

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
      { indexed: false, internalType: "bool", name: "isNewHighScore", type: "bool" },
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

const MONAD_RPC_URL = import.meta.env.VITE_MONAD_RPC || "https://rpc.ankr.com/monad_testnet";
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "";

// Validate Alchemy API key on init
if (ALCHEMY_API_KEY) {
  console.log("Alchemy API Key loaded:", ALCHEMY_API_KEY.substring(0, 8) + "...");
} else {
  console.warn("VITE_ALCHEMY_API_KEY not set - Smart Account transactions will fail");
}

const BUNDLER_URL = ALCHEMY_API_KEY
  ? `https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : "";

export const publicClient = createPublicClient({
  chain: MONAD_TESTNET,
  transport: http(MONAD_RPC_URL),
});

let currentEOAWalletClient: any = null;
let currentEOAAddress: Address | null = null;
let currentSmartAccount: any = null;
let currentSmartAccountAddress: Address | null = null;

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
  currentEOAAddress = eoaAddress;

  const walletClient = createWalletClient({
    account: eoaAddress,
    chain: MONAD_TESTNET,
    transport: custom(window.ethereum),
  });

  currentEOAWalletClient = walletClient;

  console.log("Connected EOA wallet:", eoaAddress);

  try {
    console.log("Creating MetaMask Smart Account...");
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [eoaAddress, [], [], []],
      deploySalt: "0x",
      signer: { walletClient },
    });

    currentSmartAccount = smartAccount;
    currentSmartAccountAddress = smartAccount.address;
    console.log("Smart Account address:", currentSmartAccountAddress);
  } catch (error) {
    console.error("Failed to create Smart Account (will use EOA fallback):", error);
    currentSmartAccount = null;
    currentSmartAccountAddress = null;
  }

  return eoaAddress;
}

export function getCurrentSmartAccountAddress(): Address | null {
  return currentSmartAccountAddress;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(timeoutMessage);
      error.name = "TimeoutError";
      reject(error);
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function saveScoreViaSmartAccount(
  score: number,
  onProgress?: (stage: string, secondsElapsed: number) => void
): Promise<{ hash: string; method: "smartAccount" }> {
  if (!currentSmartAccount) {
    throw new Error("Smart Account not initialized");
  }

  console.log("Attempting Smart Account transaction via bundler...");
  console.log("Smart Account Address:", currentSmartAccountAddress);
  console.log("Bundler URL:", BUNDLER_URL);
  console.log("Score:", score);

  if (!BUNDLER_URL) {
    throw new Error("Bundler URL not configured - VITE_ALCHEMY_API_KEY is missing");
  }

  const startTime = Date.now();
  let progressInterval: any = null;
  const SA_TIMEOUT = 20000; // Total timeout for Smart Account transaction
  const SEND_TIMEOUT = 12000; // 12 second timeout for sending user op (Alchemy can be slow)

  if (onProgress) {
    onProgress("Preparing Smart Account transaction...", 0);
    progressInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onProgress(`Processing Smart Account transaction... (${elapsed}s)`, elapsed);
    }, 1000);
  }

  try {
    console.log("Creating bundler client with URL:", BUNDLER_URL);
    const bundlerClient = createBundlerClient({
      client: publicClient,
      transport: http(BUNDLER_URL),
    });

    if (onProgress) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onProgress("Sending transaction to Alchemy bundler...", elapsed);
    }

    let userOpHash: string;
    try {
      userOpHash = await withTimeout(
        bundlerClient.sendUserOperation({
          account: currentSmartAccount,
          calls: [
            {
              to: CONTRACT_ADDRESS,
              abi: SCORE_STORE_ABI,
              functionName: "saveScore",
              args: [BigInt(score)],
            },
          ],
        }),
        SEND_TIMEOUT,
        "Failed to send user operation to bundler"
      );
    } catch (sendError: any) {
      console.error("Error sending user operation:", sendError);
      throw new Error(`Bundler submission failed: ${sendError?.message || sendError}`);
    }

    console.log("User Operation Hash:", userOpHash);

    if (onProgress) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onProgress("Waiting for transaction confirmation...", elapsed);
    }

    let receipt;
    try {
      receipt = await withTimeout(
        bundlerClient.waitForUserOperationReceipt({
          hash: userOpHash,
        }),
        SA_TIMEOUT,
        `Smart Account transaction timed out after ${SA_TIMEOUT / 1000} seconds`
      );
    } catch (receiptError: any) {
      console.error("Error waiting for user operation receipt:", receiptError);
      throw receiptError;
    }

    if (progressInterval) {
      clearInterval(progressInterval);
    }

    if (!receipt?.receipt?.transactionHash) {
      throw new Error("Transaction receipt missing or incomplete");
    }

    const txHash = receipt.receipt.transactionHash;
    console.log("Smart Account transaction successful! Hash:", txHash);

    if (onProgress) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onProgress(`Transaction confirmed! (${elapsed}s total)`, elapsed);
    }

    return { hash: txHash, method: "smartAccount" };
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    console.error("Smart Account transaction error:", error);
    throw error;
  }
}

async function saveScoreViaEOA(score: number): Promise<{ hash: string; method: "eoa" }> {
  if (!currentEOAWalletClient || !currentEOAAddress) {
    throw new Error("EOA wallet not connected");
  }

  console.log("Submitting score via EOA wallet:", currentEOAAddress);
  console.log("Score:", score);
  console.log("Contract Address:", CONTRACT_ADDRESS);

  // Check balance with timeout
  let balance: bigint;
  try {
    balance = await withTimeout(
      publicClient.getBalance({ address: currentEOAAddress }),
      5000,
      "Failed to check EOA balance"
    );
  } catch (balanceError: any) {
    console.error("Error checking EOA balance:", balanceError);
    // Continue anyway, let the transaction attempt and fail if no balance
    balance = BigInt(0);
  }

  console.log("EOA wallet balance:", balance.toString(), "wei");

  if (balance === BigInt(0)) {
    const fundError = new Error(`INSUFFICIENT_FUNDS:${currentEOAAddress}`);
    fundError.name = "InsufficientFundsError";
    throw fundError;
  }

  console.log("Sending transaction from EOA wallet...");

  try {
    const txHash = await currentEOAWalletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: SCORE_STORE_ABI,
      functionName: "saveScore",
      args: [BigInt(score)],
    });

    console.log("EOA transaction successful! Hash:", txHash);
    return { hash: txHash, method: "eoa" };
  } catch (txError: any) {
    console.error("EOA transaction error:", txError);
    throw txError;
  }
}

export async function saveScoreToBlockchain(
  score: number,
  onProgress?: (stage: string, secondsElapsed: number) => void
): Promise<{ hash: string; method: "smartAccount" | "eoa" }> {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Contract not deployed. Please deploy the ScoreStore contract and set VITE_CONTRACT_ADDRESS environment variable.");
  }

  if (!currentEOAWalletClient || !currentEOAAddress) {
    throw new Error("Wallet not connected. Please connect your wallet first.");
  }

  try {
    // Attempt Smart Account transaction if available and API key is set
    if (currentSmartAccount && ALCHEMY_API_KEY && ALCHEMY_API_KEY.length > 0) {
      console.log("Smart Account available, attempting transaction...");
      console.log("API Key configured:", ALCHEMY_API_KEY.substring(0, 8) + "...");

      try {
        return await saveScoreViaSmartAccount(score, onProgress);
      } catch (smartAccountError: any) {
        console.error("Smart Account transaction failed:", smartAccountError?.message || smartAccountError);

        // Don't fallback on user rejection - let it fail
        if (smartAccountError?.code === 4001 || smartAccountError?.message?.includes("User rejected")) {
          console.log("User rejected Smart Account transaction");
          throw smartAccountError;
        }

        // Don't fallback on insufficient funds in Smart Account
        if (smartAccountError?.name === "InsufficientFundsError" || smartAccountError?.message?.includes("INSUFFICIENT_FUNDS")) {
          console.log("Insufficient funds in Smart Account");
          throw smartAccountError;
        }

        // For all other errors (timeout, network errors, etc), fall back to EOA
        console.log("Smart Account failed, falling back to EOA wallet...");
        if (onProgress) {
          onProgress("Smart Account unavailable, switching to EOA wallet...", 0);
        }

        try {
          return await saveScoreViaEOA(score);
        } catch (eoaError: any) {
          console.error("EOA fallback also failed:", eoaError);
          throw eoaError;
        }
      }
    } else {
      console.log("Smart Account not configured, using EOA wallet directly");
      console.log("Smart Account exists:", !!currentSmartAccount, "API Key:", ALCHEMY_API_KEY ? "set" : "not set");
      if (onProgress) {
        onProgress("Using EOA wallet for transaction...", 0);
      }
      return await saveScoreViaEOA(score);
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
      const fundError = new Error(`INSUFFICIENT_FUNDS:${currentEOAAddress}`);
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
