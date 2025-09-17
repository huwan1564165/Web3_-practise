const { config } = require("dotenv");
const { ethers } = require("hardhat")

async function main() {
    console.log("开始部署 MyTokens 合约...");

    // 获取合约工厂
    const MyTokens = await ethers.getContractFactory("MyTokens");
    
    // 部署合约，传入构造函数参数
    const myTokens = await MyTokens.deploy("My Tokens", "MT");
    
    // 等待合约部署确认
    await myTokens.waitForDeployment();
    
    // 获取合约地址
    console.log(`MyTokens 合约已部署到地址: ${myTokens.target}`);

    //验证合约
        if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
            console.log("需等待四个区块")
            await myTokens.deploymentTransaction().wait(4);
            verifyMyTokens(myTokens.target,["My Tokens", "MT"]);
        }else{
            console.log("验证已跳过……")
        }

    // 验证初始设置
    const [deployer] = await ethers.getSigners();
    console.log("管理员地址:", deployer.address);
    
    const balance = await myTokens.balanceOf(deployer.address);
    console.log("管理员初始余额:", balance.toString());
    
    const name = await myTokens.name();
    const symbol = await myTokens.symbol();
    console.log(`代币名称: ${name}, 符号: ${symbol}`);
}
async function verifyMyTokens(fundMeAddr,args) {
    await hre.run("verify:verify",{
        address: fundMeAddr,
        constructorArguments: args,
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});