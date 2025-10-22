# Smart Account Architecture on Monad

## Why We Need Both RPC and Bundler

Your game uses **TWO different services** for Smart Accounts:

### 1. Monad RPC (Regular Blockchain Queries)
**URL**: `https://testnet-rpc.monad.xyz`

**What it does**:
- Read blockchain data (balances, contract state)
- Check if Smart Account is deployed
- Query gas prices
- Standard Ethereum JSON-RPC methods

**What it does NOT do**:
- ❌ Process ERC-4337 user operations
- ❌ Support `eth_estimateUserOperationGas`
- ❌ Act as a bundler

### 2. Pimlico Bundler (Smart Account Transactions)
**URL**: `https://api.pimlico.io/v2/10143/rpc?apikey=YOUR_KEY`

**What it does**:
- ✅ Process ERC-4337 user operations
- ✅ Estimate gas for Smart Account transactions
- ✅ Submit user operations to Monad blockchain
- ✅ Wait for transaction confirmation

**Why we need it**:
Monad's RPC doesn't include bundler functionality. You need a specialized service (Pimlico) to handle Smart Account operations.

---

## The Architecture Flow

```
┌─────────────┐
│  Your Game  │
└──────┬──────┘
       │
       ├──────────────────────────────────┬─────────────────────────────────────┐
       │                                  │                                     │
       ▼                                  ▼                                     ▼
┌──────────────────┐           ┌─────────────────────┐          ┌──────────────────────┐
│  Monad RPC       │           │  Pimlico Bundler    │          │  MetaMask Wallet     │
│  (Read Data)     │           │  (User Operations)  │          │  (Sign Transactions) │
└────────┬─────────┘           └──────────┬──────────┘          └──────────┬───────────┘
         │                                │                                │
         │                                │                                │
         └────────────────────────────────┴────────────────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   Monad Blockchain    │
                              │   (Smart Account &    │
                              │    ScoreStore.sol)    │
                              └───────────────────────┘
```

---

## Complete Transaction Flow

### Step 1: Connect Wallet
```
User clicks "Connect Wallet"
    ↓
MetaMask requests permission
    ↓
Game creates Smart Account using Delegation Toolkit
    ↓
Smart Account address: 0x4B63...0441
```

### Step 2: Submit Score
```
User plays game and clicks "Submit Score"
    ↓
Game calls Pimlico Bundler: "Estimate gas for user operation"
    ↓
Pimlico responds with gas estimates
    ↓
Game creates user operation with:
  - callData: saveScore(1)
  - sender: Smart Account address
  - gas limits from Pimlico
    ↓
User approves in MetaMask
    ↓
Game sends user operation to Pimlico
    ↓
Pimlico submits to Monad blockchain
    ↓
Monad processes transaction
    ↓
Pimlico confirms receipt
    ↓
✅ Score saved on blockchain!
```

---

## About the EntryPoint Contract

**Address**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`  
**Version**: EntryPoint v0.6 (standard ERC-4337)

### What it does:
- **Central contract** for all Smart Account operations on Monad
- **Validates** user operations before execution
- **Pays gas** from Smart Account balance
- **Executes** the actual transaction (calling your ScoreStore contract)
- **Emits events** for bundlers to track

### You don't need to configure it manually!
Pimlico's bundler automatically uses this EntryPoint contract when you send user operations.

---

## About SafeSingletonFactory

**Address**: `0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7`

### What it does:
- **Deploys contracts** with CREATE2 (deterministic addresses)
- **Used by** MetaMask Delegation Toolkit to deploy Smart Accounts
- **Ensures** same Smart Account address across chains

### When it's used:
Your Smart Account deploys automatically on the **first transaction**. The SafeSingletonFactory contract handles this deployment using CREATE2.

---

## Environment Variables Needed

```env
# Monad blockchain configuration
MONAD_RPC=https://testnet-rpc.monad.xyz
VITE_CONTRACT_ADDRESS=0x8c2b26d35c3c749ff1f4dc91c36a81b304ce36ee

# Pimlico bundler (REQUIRED for Smart Accounts)
VITE_PIMLICO_API_KEY=pim_5XNoMkKqTezE9Bzxb5xNSW
```

**All three are required** for the Smart Account flow to work!

---

## Why Can't We Use Only Monad RPC?

Monad's RPC endpoint implements **standard Ethereum JSON-RPC**:
- ✅ eth_getBalance
- ✅ eth_call
- ✅ eth_sendRawTransaction
- ✅ eth_gasPrice
- ✅ etc.

But it does NOT implement **ERC-4337 bundler methods**:
- ❌ eth_sendUserOperation
- ❌ eth_estimateUserOperationGas
- ❌ eth_getUserOperationReceipt

That's why we need Pimlico's bundler service!

---

## Alternative: Skip Smart Accounts?

If you don't want to use Pimlico, you'd need to:

1. **Use regular wallet transactions** (not Smart Accounts)
   - Users connect MetaMask normally
   - Transactions go directly to Monad RPC
   - No bundler needed
   - **BUT**: Violates competition requirement for Smart Accounts

2. **Run your own bundler**
   - Set up a bundler node yourself
   - Complex infrastructure
   - Not recommended for hackathons

3. **Use another bundler service**
   - Alchemy Account Kit
   - Gelato
   - Biconomy
   - All require similar setup

---

## Current Configuration (After Fix)

✅ **Public Client**: Monad RPC for blockchain queries  
✅ **Bundler Client**: Pimlico for user operations  
✅ **Smart Account**: MetaMask Delegation Toolkit (Hybrid)  
✅ **EntryPoint**: v0.6 (auto-detected by Pimlico)  
✅ **Gas Payment**: From Smart Account balance (user-funded)  

This configuration gives you:
- ✅ Competition-compliant Smart Accounts
- ✅ Faster transactions (compared to timeout issue)
- ✅ Reliable bundler service
- ✅ No gas sponsorship needed (user pays from Smart Account)

---

## Troubleshooting

### Error: "Method eth_estimateUserOperationGas does not exist"
**Cause**: Trying to use Monad RPC as a bundler  
**Fix**: Use Pimlico bundler URL instead (already fixed)

### Error: "VITE_PIMLICO_API_KEY is required"
**Cause**: Missing Pimlico API key  
**Fix**: Add it to your Replit Secrets

### Transaction times out
**Cause**: Pimlico may be slow on Monad (earlier issue)  
**Fix**: Already increased timeout to 5 minutes

### Smart Account has no balance
**Cause**: Haven't funded the Smart Account yet  
**Fix**: Send 0.1 MON from MetaMask to Smart Account address

---

## Summary

Your game uses a **hybrid architecture**:
- **Monad RPC** for reading blockchain data
- **Pimlico Bundler** for Smart Account transactions
- **Both working together** to enable ERC-4337 on Monad

This is the correct setup for Smart Account development on Monad testnet!
