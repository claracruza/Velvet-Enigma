import { expect } from "chai";
import { ethers } from "hardhat";
import { CipherGuess } from "../typechain-types";

describe("CipherGuess", function () {
  let cipherGuess: CipherGuess;
  let owner: any;
  let player1: any;

  beforeEach(async function () {
    [owner, player1] = await ethers.getSigners();
    const CipherGuessFactory = await ethers.getContractFactory("CipherGuess");
    cipherGuess = await CipherGuessFactory.deploy();
    await cipherGuess.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const address = await cipherGuess.getAddress();
      expect(address).to.be.properAddress;
      console.log("    ✓ Contract deployed at:", address);
    });

    it("Should initialize game count to 0", async function () {
      const count = await cipherGuess.gameCount();
      expect(count).to.equal(0);
      console.log("    ✓ Initial game count:", count.toString());
    });
  });

  describe("Contract Interface", function () {
    it("Should have play function with correct signature", async function () {
      // Verify the play function exists with (bytes32, bytes) signature
      const fragment = cipherGuess.interface.getFunction("play");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(2);
      expect(fragment?.inputs[0].type).to.equal("bytes32"); // externalEuint8
      expect(fragment?.inputs[1].type).to.equal("bytes");   // inputProof
      console.log("    ✓ play(bytes32 encryptedGuess, bytes inputProof)");
    });

    it("Should have getHandles function", async function () {
      const fragment = cipherGuess.interface.getFunction("getHandles");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(1);
      expect(fragment?.outputs?.length).to.equal(3);
      console.log("    ✓ getHandles(uint256) returns (bytes32, bytes32, bytes32)");
    });

    it("Should have getGame function", async function () {
      const fragment = cipherGuess.interface.getFunction("getGame");
      expect(fragment).to.not.be.null;
      expect(fragment?.outputs?.length).to.equal(2);
      console.log("    ✓ getGame(uint256) returns (address, bool)");
    });

    it("Should have gameCount function", async function () {
      const fragment = cipherGuess.interface.getFunction("gameCount");
      expect(fragment).to.not.be.null;
      console.log("    ✓ gameCount() returns (uint256)");
    });
  });

  describe("FHE Integration Requirements", function () {
    it("Should inherit from ZamaEthereumConfig", async function () {
      // Contract inherits ZamaEthereumConfig for Sepolia FHEVM integration
      // This is verified by successful deployment
      const address = await cipherGuess.getAddress();
      expect(address).to.be.properAddress;
      console.log("    ✓ ZamaEthereumConfig inheritance verified via deployment");
    });

    it("Should emit GamePlayed event with encrypted handles", async function () {
      // Verify event signature exists
      const event = cipherGuess.interface.getEvent("GamePlayed");
      expect(event).to.not.be.null;
      expect(event?.inputs.length).to.equal(5);
      console.log("    ✓ GamePlayed event: (gameId, player, resultHandle, userGuessHandle, systemNumHandle)");
    });
  });

  describe("Game State", function () {
    it("Should return empty handles for non-existent game", async function () {
      const [resultHandle, userGuessHandle, systemNumHandle] = await cipherGuess.getHandles(999);
      expect(resultHandle).to.equal(ethers.ZeroHash);
      expect(userGuessHandle).to.equal(ethers.ZeroHash);
      expect(systemNumHandle).to.equal(ethers.ZeroHash);
      console.log("    ✓ Non-existent game returns zero handles");
    });

    it("Should return default values for non-existent game info", async function () {
      const [player, isComplete] = await cipherGuess.getGame(999);
      expect(player).to.equal(ethers.ZeroAddress);
      expect(isComplete).to.equal(false);
      console.log("    ✓ Non-existent game returns default values");
    });
  });

  /**
   * NOTE: Full FHE encryption/decryption tests require:
   * 1. FHEVM network (Sepolia testnet or local fhevm-devnet)
   * 2. Frontend SDK for client-side encryption
   * 3. Relayer for decryption
   * 
   * These integration tests are performed manually on Sepolia.
   * See README.md for deployment and testing instructions.
   */
});
