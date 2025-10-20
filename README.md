# 🎮 Crossy Chain

**Gasless 3D On-Chain Game powered by MetaMask Smart Accounts on Monad Testnet**

A blockchain-enabled Crossy Road clone where your high scores are permanently recorded on the Monad blockchain using gasless transactions via MetaMask Smart Accounts.

---

## 🎯 Overview

Crossy Chain transforms the classic arcade experience into a Web3 gaming platform. Players navigate a chicken across treacherous lanes while their achievements are immutably stored on-chain. Built for the **MetaMask × Monad Dev Cook-Off**.

### Key Features

- 🎨 **Retro Pixel Aesthetic**: Authentic 8-bit visual style with Press Start 2P font
- 🔗 **Blockchain Integration**: Scores saved permanently on Monad Testnet
- 💸 **Gasless Transactions**: MetaMask Smart Accounts enable sponsored gas fees
- 🎮 **3D Gameplay**: Smooth Three.js rendering with responsive controls
- 🔍 **Transparent Verification**: All scores viewable on Monad Explorer

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MetaMask browser extension
- Monad testnet MON tokens (for contract deployment)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd crossy-chain

# Install dependencies
npm install

# Start development server
npm run dev
```

### Deploy Smart Contract

```bash
# Configure environment
cp .env.example .env
# Add your PRIVATE_KEY to .env

# Deploy to Monad Testnet
npx hardhat run web3/scripts/deploy.js --network monad

# Copy the deployed contract address to your frontend
```

---

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" in the top-left corner
2. **Start Playing**: Use arrow keys (↑ ↓ ← →) or on-screen buttons
3. **Navigate Safely**: Avoid cars and trucks crossing the road
4. **Earn Points**: Each lane crossed forward increases your score
5. **Save On-Chain**: Game over automatically triggers blockchain save

---

## 🏗️ Technology Stack

### Frontend
- **React** + **TypeScript** - Modern UI framework
- **Three.js** - 3D game rendering
- **Shadcn UI** - Component library
- **Tailwind CSS** - Utility-first styling

### Blockchain
- **Monad Testnet** - High-performance L1 blockchain
- **Viem** - TypeScript Ethereum client
- **MetaMask Delegation Toolkit** - Smart Account SDK
- **Hardhat** - Smart contract development

### Smart Contract
- **Solidity 0.8.20** - Contract language
- **ScoreStore.sol** - On-chain score persistence

---

## 📁 Project Structure

```
crossy-chain/
├── client/src/
│   ├── components/          # React UI components
│   │   ├── WalletConnectCard.tsx
│   │   ├── TransactionModal.tsx
│   │   ├── GameControls.tsx
│   │   └── ...
│   ├── pages/
│   │   └── game.tsx        # Main game page
│   └── index.css           # Design system
├── shared/
│   └── schema.ts           # TypeScript types
├── web3/
│   ├── contracts/
│   │   └── ScoreStore.sol  # Score storage contract
│   ├── scripts/
│   │   └── deploy.js       # Deployment script
│   └── hardhat.config.js   # Network configuration
└── package.json
```

---

## 🔐 Smart Contract

### ScoreStore.sol

```solidity
contract ScoreStore {
    mapping(address => uint256) public scores;
    event ScoreSaved(address indexed player, uint256 score);

    function saveScore(uint256 _score) external {
        require(_score > scores[msg.sender], "Lower score");
        scores[msg.sender] = _score;
        emit ScoreSaved(msg.sender, _score);
    }

    function getScore(address _player) external view returns (uint256) {
        return scores[_player];
    }
}
```

**Key Features:**
- Only accepts higher scores (prevents score degradation)
- Gas-efficient storage using mappings
- Event emission for off-chain indexing
- Simple, auditable code

---

## 🌐 Monad Network Details

| Parameter | Value |
|-----------|-------|
| **Network Name** | Monad Testnet |
| **RPC URL** | https://testnet-rpc.monad.xyz/ |
| **Chain ID** | 10143 (0x279f) |
| **Currency** | MON |
| **Explorer** | https://testnet.monadexplorer.com/ |

---

## 🎨 Design Philosophy

Crossy Chain blends nostalgic 8-bit gaming with modern Web3 UX:

- **Pixel-Perfect Typography**: Press Start 2P font for authentic retro feel
- **Vibrant Color Palette**: Game-inspired greens (grass) and reds (danger)
- **Glassmorphism Overlays**: Modern UI cards with backdrop blur
- **Smooth Animations**: Delightful micro-interactions on all elements

---

## 🧪 Testing

```bash
# Run smart contract tests
npx hardhat test

# Compile contracts
npx hardhat compile

# Run frontend (includes game testing)
npm run dev
```

---

## 🛣️ Roadmap

### MVP (Current)
- [x] Core gameplay mechanics
- [x] Wallet connection
- [x] On-chain score storage
- [x] Transaction confirmations

### Future Enhancements
- [ ] MetaMask Smart Account integration with Delegation Toolkit SDK
- [ ] Paymaster integration for true gasless transactions
- [ ] Leaderboard contract (top 10 global scores)
- [ ] NFT badges for achievements
- [ ] Mobile app (React Native)
- [ ] Multiplayer mode

**Note:** The current MVP uses standard MetaMask wallet integration. Smart Account gasless functionality is planned for v2.0.

---

## 🤝 Contributing

This is a hackathon submission, but contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **MetaMask** for Smart Account technology
- **Monad** for high-performance blockchain infrastructure
- Original Crossy Road game for inspiration
- Three.js community for 3D rendering support

---

## 📧 Contact

Built for the **MetaMask × Monad Dev Cook-Off**

- Demo: [Coming Soon]
- Repo: [This Repository]
- Contract: [Deployed Address TBD]

---

**Play. Score. Own Your Achievements. Welcome to Crossy Chain.** 🐔⛓️
