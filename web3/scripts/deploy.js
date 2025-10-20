const hre = require("hardhat");

async function main() {
  console.log("Deploying ScoreStore contract to Monad Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MON");

  const ScoreStore = await hre.ethers.getContractFactory("ScoreStore");
  const scoreStore = await ScoreStore.deploy();

  await scoreStore.waitForDeployment();

  const contractAddress = await scoreStore.getAddress();
  console.log("\n✅ ScoreStore deployed to:", contractAddress);
  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update CONTRACT_ADDRESS in client/src/lib/web3.ts");
  console.log("3. Verify on Monad Explorer:");
  console.log(`   https://testnet.monadexplorer.com/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
