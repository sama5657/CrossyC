# Deployment Guide

This guide walks you through deploying Crossy Chain to production.

## Prerequisites

1. **Get Monad Testnet MON Tokens**
   - Visit [Monad Faucet](https://faucet.testnet.monad.xyz/) (if available)
   - Or join Monad Discord for testnet tokens

2. **Prepare Environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env and add your private key (without 0x prefix)
   # NEVER commit this file to git!
   ```

## Step 1: Deploy Smart Contract

```bash
# Compile the contract
cd web3
npx hardhat compile

# Deploy to Monad Testnet
npx hardhat run scripts/deploy.js --network monad
```

**Expected Output:**
```
Deploying ScoreStore contract to Monad Testnet...
Deploying with account: 0xYourAddress
Account balance: X.XX MON

✅ ScoreStore deployed to: 0xContractAddress123...

📋 Next steps:
1. Copy the contract address above
2. Update CONTRACT_ADDRESS in .env
3. Verify on Monad Explorer:
   https://testnet.monadexplorer.com/address/0xContractAddress123...
```

## Step 2: Configure Frontend

```bash
# Create .env file if it doesn't exist
cp .env.example .env

# Update VITE_CONTRACT_ADDRESS with deployed contract address
# Edit .env and replace:
# VITE_CONTRACT_ADDRESS=0xContractAddress123...
```

**Important:** Replace `0xContractAddress123...` with the actual deployed contract address from Step 1.

## Step 3: Test Locally

```bash
# Start development server
npm run dev

# Open http://localhost:5000
# Test the full flow:
# 1. Connect wallet
# 2. Play game
# 3. Get game over
# 4. Verify transaction on explorer
```

## Step 4: Deploy Frontend

### Option A: Deploy on Replit

1. Click "Deploy" button in Replit
2. Follow the deployment wizard
3. Your app will be live at: `https://your-repl.replit.app`

### Option B: Deploy on Vercel/Netlify

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel

# Or deploy to Netlify
npx netlify deploy --prod
```

## Verification Checklist

After deployment, verify:

- [ ] Contract deployed and verified on Monad Explorer
- [ ] Frontend can connect to MetaMask
- [ ] Game renders and plays smoothly
- [ ] Scores save to blockchain successfully
- [ ] Transaction appears on Monad Explorer
- [ ] Environment variables are set correctly

## Troubleshooting

### Contract Deployment Fails

```bash
# Check your balance
npx hardhat run scripts/check-balance.js --network monad

# Verify network configuration
cat web3/hardhat.config.js
```

### Frontend Can't Connect

- Ensure MetaMask is installed
- Check that you're on Monad Testnet (Chain ID: 10143)
- Add Monad network to MetaMask manually if needed

### Transaction Fails

- Check contract address is correct in `.env`
- Verify you have enough MON for gas
- Check score is higher than previous score
- View detailed error in browser console

## MetaMask Smart Account Integration

For gasless transactions using MetaMask Smart Accounts:

1. **Update Web3 Client** (Coming Soon)
   - Integrate `@metamask/delegation-toolkit`
   - Configure paymaster for gas sponsorship
   - Update transaction flow to use Smart Account

2. **Testing Smart Accounts**
   - Requires MetaMask version 11+
   - Enable experimental features in MetaMask settings
   - Follow MetaMask documentation for Delegation Toolkit

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PRIVATE_KEY` | Deployer wallet private key | `abc123...` |
| `MONAD_RPC` | Monad RPC endpoint | `https://testnet-rpc.monad.xyz/` |
| `VITE_CONTRACT_ADDRESS` | Deployed ScoreStore address | `0x123...` |

## Security Notes

- **NEVER** commit `.env` file
- **NEVER** share your private key
- Use a dedicated wallet for deployment
- Test on testnet before mainnet
- Audit smart contract before production

## Support

For issues or questions:
- Check [Monad Documentation](https://docs.monad.xyz/)
- Join [Monad Discord](https://discord.gg/monad)
- Review [MetaMask Developer Docs](https://docs.metamask.io/)
