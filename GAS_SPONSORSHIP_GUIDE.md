# Gas Sponsorship Guide for Crossy Chain

## Current Situation

Right now, your game is **not fully gasless** for users. Here's what's happening:

1. ✅ **Pimlico Bundler**: Your game uses Pimlico to submit transactions (bundler service)
2. ❌ **No Paymaster**: Users still need MON tokens in their Smart Account to pay gas fees
3. 💡 **The Smart Account**: When users connect, a separate Smart Account is created (different from their MetaMask wallet)

## Understanding the Components

### What is Pimlico?

**Pimlico** provides TWO services:

1. **Bundler Service** (✅ You're already using this)
   - Submits ERC-4337 user operations to the blockchain
   - Handles smart account transactions
   - Your API key enables this

2. **Paymaster Service** (❌ Not currently enabled)
   - **Sponsors gas fees** so users don't pay anything
   - Requires setting up a sponsorship policy
   - Requires funding your paymaster balance

### Why Do Users Need MON in Their Smart Account?

- The Smart Account (e.g., `0x4B63...0441`) is a **separate blockchain account**
- It's linked to your MetaMask wallet but has its own address and balance
- Without a paymaster, this account needs MON tokens to pay for gas
- **This is why the transaction fails** - the Smart Account has 0 MON

## Solution Options

### Option 1: Enable Pimlico Paymaster (Recommended for Production)

This makes transactions **truly gasless** for your users - you sponsor the gas fees from your account.

#### Step 1: Set Up Pimlico Dashboard

1. Go to https://dashboard.pimlico.io
2. Sign in with your account
3. Navigate to "Paymasters" section
4. Create a new **Sponsorship Policy** for Monad testnet
5. Add funds to your paymaster balance (you'll need to deposit funds)
6. Copy your **Sponsorship Policy ID** (looks like `sp_xxxxx`)

#### Step 2: Add Environment Variable

Add a new secret in Replit:
```
VITE_SPONSORSHIP_POLICY_ID=sp_your_policy_id_here
```

#### Step 3: Update Your Code

I can update the code to use the paymaster when available. The changes needed:

1. Create a paymaster client from Pimlico
2. Pass paymaster data when sending user operations
3. Remove the balance check (since paymaster will pay)

**Cost**: You pay for users' gas fees (around $0.01-0.10 per transaction on testnets)

---

### Option 2: Manual Funding (Quick Test)

For testing purposes, you can manually send MON tokens to the Smart Account:

1. Copy the Smart Account address (shown in the game's top-left when connected)
2. In MetaMask, send 0.1 MON from your regular wallet to the Smart Account address
3. Try submitting the score again

**Pros**: Quick to test
**Cons**: Every user needs to manually fund their Smart Account

---

### Option 3: Faucet Integration (For Hackathons/Testing)

Get testnet MON tokens from Monad faucet and send to Smart Accounts automatically:

1. Use Monad testnet faucet: https://www.monadexplorer.com/faucet
2. Request tokens for the Smart Account address
3. Users can then submit transactions

**Pros**: Free testnet tokens
**Cons**: Manual process, not suitable for production

---

## How Paymaster Works (Technical Details)

When you enable Pimlico's Verifying Paymaster:

```
User clicks "Submit Score"
    ↓
Smart Account creates user operation
    ↓
Pimlico Paymaster reviews the operation
    ↓
Paymaster adds sponsorship signature
    ↓
Pimlico Bundler submits to blockchain
    ↓
✅ Transaction confirmed (gas paid by YOUR paymaster balance)
```

## Cost Breakdown

### With Paymaster (Option 1)
- **User pays**: $0.00 (gasless!)
- **You pay**: ~$0.01-0.10 per transaction (your paymaster balance)
- **Best for**: Production apps, good UX

### Without Paymaster (Current State)
- **User pays**: Must fund Smart Account with MON
- **You pay**: $0.00
- **Best for**: Testing only (bad UX)

## Alternative Services

If Pimlico doesn't support Monad well, consider:

1. **Alchemy Gas Manager** - 8% markup, supports 100+ chains
2. **Thirdweb** - Flexible sponsorship
3. **Coinbase CDP Paymaster** - $100 free credits
4. **Circle Paymaster** - Users pay in USDC instead of native tokens

## Recommendations

### For Hackathon Demo
**Option 2** (Manual Funding) - Quick and simple:
- Just send 0.1 MON to your Smart Account before demos
- Shows the blockchain integration works

### For Production/Launch
**Option 1** (Enable Paymaster) - Professional UX:
- Set up proper gas sponsorship
- Users don't need to understand crypto
- Smooth onboarding experience

## Next Steps

Would you like me to:

1. **Enable Pimlico Paymaster** (requires your Sponsorship Policy ID)?
2. **Show you how to manually fund** your Smart Account for quick testing?
3. **Look into alternative paymaster services** that might work better with Monad?

Let me know which approach you'd prefer!
