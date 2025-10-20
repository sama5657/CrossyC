import type { Address } from "viem";

interface SmartAccountClient {
  address: Address;
  sendTransaction: (params: any) => Promise<string>;
}

export async function createSmartAccountClient(): Promise<SmartAccountClient | null> {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    }) as Address[];

    return {
      address: accounts[0],
      sendTransaction: async (params: any) => {
        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [params],
        });
        return txHash;
      },
    };
  } catch (error) {
    console.error("Failed to create Smart Account client:", error);
    return null;
  }
}

export function isSmartAccountSupported(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}
