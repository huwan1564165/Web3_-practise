async function main() {
  console.log("开始部署 MyTokens 合约...");

  // 获取合约工厂
  const MyTokens = await ethers.getContractFactory("MyTokens");
  
  // 部署合约，传入构造函数参数
  const myTokens = await MyTokens.deploy("My Hardhat Token", "MHT");
  
  // 等待合约部署确认
  await myTokens.waitForDeployment();
  
  // 获取合约地址
  const address = await myTokens.getAddress();
  console.log("MyTokens 合约已部署到地址:", address);

  // 验证初始设置
  const [deployer] = await ethers.getSigners();
  console.log("管理员地址:", deployer.address);
  
  const balance = await myTokens.balanceOf(deployer.address);
  console.log("管理员初始余额:", balance.toString());
  
  const name = await myTokens.name();
  const symbol = await myTokens.symbol();
  console.log(`代币名称: ${name}, 符号: ${symbol}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});