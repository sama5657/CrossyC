# Crossy Chain - Blockchain Gaming on Monad Testnet

## Project Overview

Crossy Chain is a Web3-enabled 3D game built with Three.js, React, and TypeScript for the **MetaMask Smart Accounts x Monad Dev Cook Off** hackathon. Players control a chicken crossing lanes of traffic and forests, with their high scores permanently recorded on the Monad blockchain via **MetaMask Smart Accounts** using the **Delegation Toolkit SDK**.

## Architecture

### Frontend Stack
- **React** + **TypeScript**: Modern UI framework
- **Three.js**: 3D game rendering engine
- **Viem**: Ethereum client library
- **@metamask/delegation-toolkit**: Smart Account integration
- **Shadcn UI**: Component library with retro pixel aesthetic
- **Tailwind CSS**: Utility-first styling

### Blockchain Stack
- **Monad Testnet**: Layer 1 blockchain (Chain ID: 10143, RPC: https://rpc.ankr.com/monad_testnet)
- **Solidity 0.8.20**: Smart contract language
- **Hardhat**: Development environment
- **MetaMask Smart Accounts**: ERC-4337 account abstraction with Delegation Toolkit SDK
- **Bundler Client**: Viem bundler for user operation submission
- **Smart Account Features**: Gasless transactions, automatic deployment, improved UX

### Smart Contract
- **ScoreStore.sol**: On-chain score tracking contract
  - `saveScore(uint256)`: Save player's score
  - `getScore(address)`: Retrieve player's best score
  - Only allows score updates if new score > existing score

## Key Features

1. **MetaMask Smart Account Integration**: Connect MetaMask extension to automatically create a Smart Account using Delegation Toolkit
2. **ERC-4337 User Operations**: Score submissions via bundler using account abstraction
3. **3D Gameplay**: Retro-style Crossy Road clone with Three.js rendering
4. **On-Chain Scores**: Permanent high score storage on Monad blockchain via user operations
5. **Automatic Smart Account Deployment**: First transaction deploys the smart account automatically
6. **Block Explorer Links**: View transaction receipts on Monad Explorer
7. **Responsive UI**: Pixel-art aesthetic with mobile controls
8. **Hackathon Compliant**: Meets all MetaMask Smart Accounts x Monad requirements

## Project Structure

```
crossy-chain/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── WalletConnectCard.tsx
│   │   │   ├── NetworkBadge.tsx
│   │   │   ├── TransactionModal.tsx
│   │   │   ├── GameControls.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   └── GameOverModal.tsx
│   │   ├── pages/
│   │   │   └── game.tsx       # Main game page
│   │   └── index.css          # Design system
├── server/                    # Backend (minimal - blockchain is the backend)
├── shared/
│   └── schema.ts             # TypeScript types for Web3 data
├── web3/
│   ├── contracts/
│   │   └── ScoreStore.sol    # Score storage contract
│   ├── scripts/
│   │   └── deploy.js         # Deployment script
│   └── hardhat.config.js     # Hardhat configuration
└── README.md
```

## Development Status

### Completed
- [x] Schema definition for Web3 data types (WalletState, TransactionData, ScoreData)
- [x] Design system configuration (retro pixel aesthetic with Press Start 2P font)
- [x] All React UI components (WalletConnectCard, TransactionModal, GameControls, etc.)
- [x] Responsive layout and controls
- [x] Smart contract development (ScoreStore.sol)
- [x] Hardhat deployment setup for Monad Testnet
- [x] Three.js game integration into React
- [x] **MetaMask Delegation Toolkit integration** (@metamask/delegation-toolkit)
- [x] **Smart Account creation with Hybrid implementation**
- [x] **Bundler client configuration for Monad testnet**
- [x] **User operation submission for score saving**
- [x] **Automatic smart account deployment on first transaction**
- [x] Web3 client connection using Viem
- [x] Full integration (wallet → smart account → game → blockchain via bundler)
- [x] Transaction flow implementation with user operations
- [x] On-chain score submission via ERC-4337
- [x] Netlify deployment configuration (netlify.toml + _redirects)

### Ready for Testing
- [ ] Deploy ScoreStore contract to Monad Testnet (requires deployer private key)
- [ ] Set VITE_CONTRACT_ADDRESS environment variable
- [ ] End-to-end testing with actual blockchain
- [ ] Verify user operations on Monad Explorer

## Design Guidelines

The application follows a retro arcade aesthetic:
- **Font**: Press Start 2P (pixel font)
- **Colors**: Dark mode with vibrant game colors (green grass, red danger)
- **Components**: Glassmorphism cards with pixel borders
- **Interactions**: Smooth animations with retro feel

## Network Details

- **Network**: Monad Testnet
- **RPC**: https://rpc.ankr.com/monad_testnet
- **Chain ID**: 10143 (0x279f)
- **Explorer**: https://testnet.monadexplorer.com/
- **Currency**: MON (testnet)
- **Bundler**: Alchemy (https://monad-testnet.g.alchemy.com)

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy contract (when ready)
npx hardhat run web3/scripts/deploy.js --network monad
```

## User Journey

1. **Connect Wallet**: Click "Connect Wallet" to connect MetaMask extension
2. **Smart Account Creation**: System automatically creates a MetaMask Smart Account (Hybrid implementation) linked to your EOA
3. **Play Game**: Use arrow keys or on-screen buttons to move chicken across lanes
4. **Earn Score**: Cross lanes to increase score, avoid vehicles
5. **Game Over**: Get hit by vehicle → click "Submit Score On-Chain"
6. **User Operation**: Score is submitted via bundler as a user operation (ERC-4337)
7. **Auto-Deploy**: If smart account not deployed, it deploys automatically with first transaction
8. **View Transaction**: Check Monad Explorer for transaction receipt confirmation

## Recent Changes

- **2025-10-22**: **MetaMask Smart Accounts Integration Complete**
  - Integrated @metamask/delegation-toolkit SDK
  - Implemented smart account creation with Hybrid implementation
  - Updated score submission to use ERC-4337 user operations via bundler
  - Added automatic smart account deployment on first transaction
  - Created Netlify deployment configuration for SPA routing
  - Updated documentation with Smart Accounts workflow

- **2025-01-20**: Initial setup with schema, design system, and all UI components
  - Frontend components complete with pixel-perfect retro aesthetic
  - Responsive controls for desktop and mobile gameplay

## Technical Implementation Notes

### MetaMask Smart Accounts Integration

This project uses the **MetaMask Delegation Toolkit SDK** to implement ERC-4337 account abstraction:

**Key Components:**
- `toMetaMaskSmartAccount()`: Creates a Hybrid smart account linked to user's EOA
- `createBundlerClient()`: Viem bundler client for submitting user operations
- `sendUserOperation()`: Submits transactions via bundler instead of direct RPC

**Flow:**
1. User connects MetaMask extension (EOA)
2. System creates a Smart Account with the EOA as signer
3. Smart Account address is displayed in UI
4. Game scores are submitted via user operations, not regular transactions
5. Bundler handles transaction processing and smart account deployment

**Benefits:**
- **Improved UX**: Users interact with a smart contract account
- **Account Abstraction**: ERC-4337 compliant
- **Automatic Deployment**: Smart account deploys on first use
- **Future Ready**: Enables gasless transactions with paymaster integration

### Hackathon Compliance

**MetaMask Smart Accounts x Monad Dev Cook Off Requirements:**
- ✅ Uses MetaMask Smart Accounts (Delegation Toolkit SDK)
- ✅ Deployed on Monad testnet (Chain ID: 10143)
- ✅ Integration shown in main application flow (score submission)
- ✅ Uses signer-agnostic approach (works with MetaMask extension)

### Deployment Notes

- **Netlify Configuration**: `netlify.toml` + `client/public/_redirects` for SPA routing
- **Required Environment Variables**:
  - `VITE_CONTRACT_ADDRESS`: ScoreStore.sol contract address on Monad testnet
  - `VITE_ALCHEMY_API_KEY`: Free API key from https://dashboard.alchemy.com (required for bundler)
  - `MONAD_RPC`: Monad RPC URL (defaults to https://rpc.ankr.com/monad_testnet)
- **Smart Contract**: Deploy to Monad testnet using Hardhat with deployer private key
- **Gas Costs**: User pays gas for user operations (paymaster integration optional)
- **Setup Guide**: See `SETUP.md` for complete setup instructions
