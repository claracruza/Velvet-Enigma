import { expect } from "chai";
import { ethers } from "hardhat";
import { VelvetEnigma } from "../typechain-types";

describe("VelvetEnigma", function () {
  let velvetEnigma: VelvetEnigma;
  let owner: any;
  let player1: any;

  beforeEach(async function () {
    [owner, player1] = await ethers.getSigners();
    const VelvetEnigmaFactory = await ethers.getContractFactory("VelvetEnigma");
    velvetEnigma = await VelvetEnigmaFactory.deploy();
    await velvetEnigma.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const address = await velvetEnigma.getAddress();
      expect(address).to.be.properAddress;
    });

    it("Should initialize game count to 0", async function () {
      const count = await velvetEnigma.gameCount();
      expect(count).to.equal(0);
    });
  });

  describe("Contract Interface", function () {
    it("Should have play function with correct signature", async function () {
      const fragment = velvetEnigma.interface.getFunction("play");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(2);
      expect(fragment?.inputs[0].type).to.equal("bytes32");
      expect(fragment?.inputs[1].type).to.equal("bytes");
    });

    it("Should have getHandles function", async function () {
      const fragment = velvetEnigma.interface.getFunction("getHandles");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(1);
      expect(fragment?.outputs?.length).to.equal(3);
    });

    it("Should have getGame function", async function () {
      const fragment = velvetEnigma.interface.getFunction("getGame");
      expect(fragment).to.not.be.null;
      expect(fragment?.outputs?.length).to.equal(2);
    });

    it("Should have gameCount function", async function () {
      const fragment = velvetEnigma.interface.getFunction("gameCount");
      expect(fragment).to.not.be.null;
    });
  });

  describe("Game State", function () {
    it("Should return empty handles for non-existent game", async function () {
      const [resultHandle, userGuessHandle, systemNumHandle] = await velvetEnigma.getHandles(999);
      expect(resultHandle).to.equal(ethers.ZeroHash);
      expect(userGuessHandle).to.equal(ethers.ZeroHash);
      expect(systemNumHandle).to.equal(ethers.ZeroHash);
    });

    it("Should return default values for non-existent game info", async function () {
      const [player, isComplete] = await velvetEnigma.getGame(999);
      expect(player).to.equal(ethers.ZeroAddress);
      expect(isComplete).to.equal(false);
    });
  });
});

