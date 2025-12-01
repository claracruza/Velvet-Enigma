# Velvet Enigma

A luxurious number guessing game powered by **Fully Homomorphic Encryption (FHE)** on the Ethereum Sepolia testnet.

![FHEVM](https://img.shields.io/badge/FHEVM-v0.9-gold) ![Sepolia](https://img.shields.io/badge/Network-Sepolia-blue) ![Tests](https://img.shields.io/badge/Tests-10%20passing-brightgreen) ![License](https://img.shields.io/badge/License-MIT-green)

**Live Contract:** [0x9ca8e64B109139EF09994069792e20108315a87D](https://sepolia.etherscan.io/address/0x9ca8e64B109139EF09994069792e20108315a87D#code)

---

## Overview

Velvet Enigma is a privacy-preserving number guessing game that demonstrates **true end-to-end FHE encryption**. Players guess a number (1-8), and the entire game logic executes on encrypted data — no plaintext is ever exposed on-chain.

### Key Features

- **Frontend Encryption** - User's guess is encrypted in the browser before submission
- **On-Chain FHE Computation** - Contract generates encrypted random number and performs encrypted comparison
- **User Decryption via Signature** - Only the player can decrypt results using their wallet signature
- **Zero Plaintext Exposure** - Neither user guess nor system number is ever visible on-chain

---

## How It Works

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           VELVET ENIGMA FLOW                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. CONNECT      2. SELECT       3. ENCRYPT       4. COMPUTE      5. DECRYPT │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    │
│  │ Wallet  │───▶│ Number  │───▶│ Browser │───▶│Contract │───▶│ Wallet  │    │
│  │ Connect │    │  1-8    │    │   FHE   │    │   FHE   │    │  Sign   │    │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘    │
│                                     │              │              │          │
│                              Ciphertext      Ciphertext      Plaintext       │
│                               on-chain       compute         result          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

1. **Connect Wallet** - Link MetaMask or compatible wallet to Sepolia testnet
2. **Select Number** - Choose a number (1-8) from the elegant UI
3. **Frontend Encryption** - SDK encrypts your guess client-side using FHE public key
4. **On-Chain FHE** - Contract receives ciphertext, generates encrypted random, performs `FHE.eq()` comparison
5. **Wallet Signature Decryption** - Sign EIP-712 message to decrypt results via Zama relayer

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contract | Solidity 0.8.24 + FHEVM v0.9 |
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Wallet | Wagmi v2 + Viem |
| FHE SDK | @zama-fhe/relayer-sdk v0.3.0 |
| Network | Ethereum Sepolia Testnet |

---

## Project Structure

```
velvet-enigma/
├── contracts/                    # Hardhat smart contract project
│   ├── contracts/
│   │   └── CipherGuess.sol       # Main FHE game contract
│   ├── scripts/
│   │   └── deploy.ts             # Deployment script
│   ├── test/
│   │   └── CipherGuess.test.ts   # Contract unit tests
│   └── hardhat.config.ts
├── frontend/                     # Next.js frontend application
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   ├── components/           # React components
│   │   │   ├── GameSection.tsx   # Main game logic with FHE
│   │   │   ├── ConnectButton.tsx # Wallet connection modal
│   │   │   └── ...
│   │   └── lib/
│   │       └── contract.ts       # Contract address & ABI
│   └── ...
└── README.md
```

---

## Smart Contract

### CipherGuess.sol

The contract implements true end-to-end FHE with frontend encryption:

```solidity
// Accept frontend-encrypted input (NO plaintext in calldata)
function play(externalEuint8 encryptedGuess, bytes calldata inputProof) external returns (uint256 gameId) {
    // 1. Verify and convert frontend-encrypted input
    euint8 userGuess = FHE.fromExternal(encryptedGuess, inputProof);
    
    // 2. Generate encrypted random number (1-8)
    euint8 systemNum = FHE.add(FHE.randEuint8(8), FHE.asEuint8(1));
    
    // 3. Encrypted comparison - ALL IN CIPHERTEXT
    ebool isMatch = FHE.eq(userGuess, systemNum);
    
    // 4. Grant decryption permission to player
    FHE.allow(isMatch, msg.sender);
    FHE.allow(userGuess, msg.sender);
    FHE.allow(systemNum, msg.sender);
}
```

### FHEVM Integration

| Function | Purpose |
|----------|---------|
| `FHE.fromExternal()` | Verify frontend-encrypted input with proof |
| `FHE.randEuint8(8)` | Generate encrypted random number [0-7] |
| `FHE.eq()` | Encrypted equality comparison |
| `FHE.allow()` | Grant user decryption permission |
| `FHE.toBytes32()` | Convert encrypted value to handle for decryption |

---

## Testing

### Unit Tests

```bash
cd contracts
pnpm test
```

### Test Results

```
  CipherGuess
    Deployment
      ✔ Should deploy successfully
      ✔ Should initialize game count to 0
    Contract Interface
      ✔ Should have play function with correct signature
      ✔ Should have getHandles function
      ✔ Should have getGame function
      ✔ Should have gameCount function
    FHE Integration Requirements
      ✔ Should inherit from ZamaEthereumConfig
      ✔ Should emit GamePlayed event with encrypted handles
    Game State
      ✔ Should return empty handles for non-existent game
      ✔ Should return default values for non-existent game info

  10 passing (1s)
```

### Integration Testing

Full FHE integration tests are performed on Sepolia testnet:
- ✅ Frontend encryption with `@zama-fhe/relayer-sdk`
- ✅ Encrypted input verification via `FHE.fromExternal()`
- ✅ On-chain FHE computation with `FHE.randEuint8()` and `FHE.eq()`
- ✅ User decryption via EIP-712 signature and Zama relayer

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MetaMask wallet with Sepolia ETH

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd velvet-enigma

# Install contract dependencies
cd contracts
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### Environment Setup

Create `.env` in the contracts directory:

```env
PRIVATE_KEY=your_deployer_private_key
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deploy Contract

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Run Frontend

```bash
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Business Potential

Velvet Enigma demonstrates practical FHE applications with significant market potential:

| Application | Description |
|-------------|-------------|
| **Provably Fair Gaming** | Casino games where randomness is cryptographically enforced and verifiable |
| **Sealed-Bid Auctions** | Private bidding where bids remain encrypted until reveal |
| **Confidential Voting** | Secret ballot systems with encrypted tallying |
| **Private Lotteries** | Number selection games where picks remain hidden |
| **Prediction Markets** | Private predictions with encrypted outcomes |

### Competitive Advantage

- **True Privacy** - Unlike commit-reveal schemes, data remains encrypted throughout
- **On-Chain Verification** - All computation is verifiable on the blockchain
- **User-Controlled Decryption** - Only authorized users can reveal results

---

## Development

### Contract Testing

```bash
cd contracts
pnpm test          # Run unit tests
pnpm compile       # Compile contracts
```

### Frontend Development

```bash
cd frontend
pnpm dev           # Start development server
pnpm lint          # Run linter
pnpm build         # Production build
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Zama](https://www.zama.ai/) - FHE technology and FHEVM
- [Zama Developer Program](https://docs.zama.org/programs/developer-program)

---

**Built with 🔐 for the Zama Developer Program**
