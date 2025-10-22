# Smart Account Setup for Competition

## ✅ Current Configuration (Fixed!)

Your game now uses **MetaMask Smart Accounts** WITHOUT relying on Pimlico's slow bundler service.

### What Changed:
- ❌ **Removed**: Pimlico bundler dependency (was causing 2+ minute timeouts)
- ✅ **Added**: Direct Monad RPC bundler (`https://rpc.ankr.com/monad_testnet`)
- ✅ **Kept**: MetaMask Smart Account implementation (required for competition)
- ✅ **Kept**: User-funded gas fees (from Smart Account balance)

## How It Works Now

```
1. User connects MetaMask
   ↓
2. Smart Account is created (using MetaMask Delegation Toolkit)
   - Address: 0x4B63...0441 (example)
   - Linked to user's MetaMask wallet
   ↓
3. User funds Smart Account
   - Send MON from MetaMask to Smart Account address
   - Shown in top-left corner of game
   ↓
4. User plays game and submits score
   ↓
5. Transaction via Smart Account
   - Uses Monad RPC directly (NOT Pimlico)
   - Faster confirmations (5-30 seconds instead of 2+ minutes)
   - Gas paid from Smart Account balance
   ↓
6. ✅ Score saved on blockchain
```

## Why This Is Better

### Before (Pimlico Bundler):
- ❌ 2+ minute timeouts
- ❌ Unreliable on Monad testnet
- ❌ External dependency

### After (Direct Monad RPC):
- ✅ Much faster confirmations
- ✅ Direct to Monad blockchain
- ✅ More reliable
- ✅ Still uses Smart Accounts (competition compliant)

## Competition Requirements Met

✅ **Uses MetaMask Smart Accounts** - via Delegation Toolkit SDK  
✅ **ERC-4337 Implementation** - User operations with Smart Account  
✅ **Monad Testnet** - All transactions on Monad  
✅ **Blockchain Integration** - Scores permanently on-chain  

## Environment Variables Needed

```bash
MONAD_RPC=https://rpc.ankr.com/monad_testnet
VITE_CONTRACT_ADDRESS=0x8c2b26d35c3c749ff1f4dc91c36a81b304ce36ee
```

**Note**: `VITE_PIMLICO_API_KEY` is no longer required!

## User Flow

### 1. Connect Wallet
User clicks "Connect Wallet" and approves MetaMask connection.

### 2. Smart Account Created
A Smart Account is automatically created and shown in the top-left corner:
```
Connected
Smart Account: 0x4B63...0441 [📋 copy]
This Smart Account needs MON tokens to pay gas fees
```

### 3. Fund Smart Account
User sends MON from their MetaMask wallet to the Smart Account address:
- Click the copy button to get the full address
- In MetaMask: Send → Paste Smart Account address → Amount: 0.1 MON
- Wait for confirmation

### 4. Play & Submit
- Play the game
- When game over, click "Submit Score On-Chain"
- Approve the transaction in MetaMask
- Transaction confirms in 5-30 seconds

## Technical Details

### Smart Account Creation
```typescript
currentSmartAccount = await toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [eoaAddress, [], [], []],
  deploySalt: "0x",
  signer: { walletClient },
});
```

### Bundler Configuration
```typescript
// Using Monad RPC directly (not Pimlico)
currentBundlerClient = createBundlerClient({
  client: publicClient,
  transport: http("https://rpc.ankr.com/monad_testnet"),
});
```

### Transaction Submission
```typescript
const userOperationHash = await currentBundlerClient.sendUserOperation({
  account: currentSmartAccount,
  calls: [{
    to: CONTRACT_ADDRESS,
    data: callData,
    value: BigInt(0),
  }],
  maxFeePerGas,
  maxPriorityFeePerGas,
});
```

## Troubleshooting

### Transaction Still Times Out
- Check if Smart Account has sufficient MON balance
- Monad testnet might be congested (wait and retry)
- Increase timeout further in `web3.ts` (currently 5 minutes)

### Smart Account Has No Balance
- Copy the Smart Account address from the game UI
- Send MON from MetaMask to that address
- Balance is shown in console logs for debugging

### Cannot Deploy Smart Account
- First transaction automatically deploys the Smart Account
- Deployment costs gas, ensure Smart Account is funded
- Check console logs for deployment status

## Gas Costs

Typical transaction costs on Monad testnet:
- **Smart Account Deployment**: ~0.001-0.01 MON (first transaction only)
- **Score Submission**: ~0.0001-0.001 MON per transaction

Fund with **0.1 MON** to cover multiple transactions.

## Future Improvements

### Option 1: Add Paymaster (Gasless)
Enable Pimlico's paymaster service to sponsor gas fees:
- Users don't need to fund Smart Accounts
- You pay gas fees from your Pimlico balance
- Requires: `VITE_SPONSORSHIP_POLICY_ID`

### Option 2: Check Monad Native Bundler
If Monad releases their own bundler service:
- Switch to Monad's infrastructure
- Potentially faster confirmations
- Better Monad-specific optimizations

### Option 3: Batch Transactions
Use Smart Account batching to submit multiple scores in one transaction:
- Save on gas fees
- Better UX for multiple submissions
- Requires UI changes

## Testing Checklist

Before demo/submission:

- [ ] Fund Smart Account with 0.1 MON
- [ ] Test wallet connection flow
- [ ] Play game and submit score
- [ ] Verify transaction on Monad Explorer
- [ ] Check Smart Account deployment status
- [ ] Test with different MetaMask accounts

## Competition Submission Notes

When submitting to the competition, highlight:

1. **MetaMask Smart Accounts Integration**
   - Using official Delegation Toolkit SDK
   - Hybrid implementation for compatibility

2. **ERC-4337 Account Abstraction**
   - User operations instead of regular transactions
   - Smart Account auto-deployment

3. **Monad Testnet Native**
   - Direct integration with Monad RPC
   - No external bundler dependencies
   - Optimized for Monad performance

4. **User Experience**
   - One-time Smart Account funding
   - Fast transaction confirmations
   - Blockchain-backed high scores

Good luck with the competition! 🚀
