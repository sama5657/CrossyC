# Crossy Chain - Blockchain Gaming on Monad Testnet

## Project Overview

Crossy Chain is a Web3-enabled 3D game built with Three.js, React, and TypeScript. Players control a chicken crossing lanes of traffic and forests, with their high scores permanently recorded on the Monad blockchain via MetaMask Smart Accounts.

## Architecture

### Frontend Stack
- **React** + **TypeScript**: Modern UI framework
- **Three.js**: 3D game rendering engine
- **Viem**: Ethereum client library
- **@metamask/delegation-toolkit**: Smart Account integration
- **Shadcn UI**: Component library with retro pixel aesthetic
- **Tailwind CSS**: Utility-first styling

### Blockchain Stack
- **Monad Testnet**: Layer 1 blockchain (Chain ID: 10143)
- **Solidity 0.8.20**: Smart contract language
- **Hardhat**: Development environment
- **MetaMask Smart Accounts**: Gasless transaction support

### Smart Contract
- **ScoreStore.sol**: On-chain score tracking contract
  - `saveScore(uint256)`: Save player's score
  - `getScore(address)`: Retrieve player's best score
  - Only allows score updates if new score > existing score

## Key Features

1. **Wallet Integration**: Connect MetaMask to create Smart Account
2. **3D Gameplay**: Retro-style Crossy Road clone with Three.js
3. **On-Chain Scores**: Permanent high score storage on Monad blockchain
4. **Gasless Transactions**: Smart Account enables sponsored transactions
5. **Block Explorer Links**: View transactions on Monad Explorer
6. **Responsive UI**: Pixel-art aesthetic with mobile controls

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
- [x] Web3 client connection using Viem
- [x] Full integration (wallet → game → blockchain)
- [x] Transaction flow implementation
- [x] On-chain score submission logic

### Ready for Testing
- [ ] Deploy contract to Monad Testnet (requires private key)
- [ ] End-to-end testing with actual blockchain
- [ ] Verify transaction on Monad Explorer

## Design Guidelines

The application follows a retro arcade aesthetic:
- **Font**: Press Start 2P (pixel font)
- **Colors**: Dark mode with vibrant game colors (green grass, red danger)
- **Components**: Glassmorphism cards with pixel borders
- **Interactions**: Smooth animations with retro feel

## Network Details

- **Network**: Monad Testnet
- **RPC**: https://testnet-rpc.monad.xyz/
- **Chain ID**: 10143 (0x279f)
- **Explorer**: https://testnet.monadexplorer.com/
- **Currency**: MON (testnet)

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

1. **Connect Wallet**: Click "Connect Wallet" to create Smart Account
2. **Play Game**: Use arrow keys or on-screen buttons to move chicken
3. **Earn Score**: Cross lanes to increase score
4. **Game Over**: Get hit by vehicle → score automatically saved on-chain
5. **View Transaction**: Check Monad Explorer for confirmation

## Recent Changes

- **2025-01-20**: Initial setup with schema, design system, and all UI components
- Frontend components complete with pixel-perfect retro aesthetic
- Responsive controls for desktop and mobile gameplay

## Notes

- This is a hackathon submission for MetaMask × Monad Dev Cook-Off
- Smart contract deployment requires Monad testnet MON tokens
- Transaction sponsorship (gasless) is optional - falls back to user-paid gas
