import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CipherGuess contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const CipherGuess = await ethers.getContractFactory("CipherGuess");
  const cipherGuess = await CipherGuess.deploy();

  await cipherGuess.waitForDeployment();

  const address = await cipherGuess.getAddress();
  console.log("CipherGuess deployed to:", address);

  console.log("\n========================================");
  console.log("Deployment Summary:");
  console.log("Contract Address:", address);
  console.log("Network: Sepolia");
  console.log("========================================");
  console.log("\nTo verify on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

