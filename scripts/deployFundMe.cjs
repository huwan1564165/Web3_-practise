//引入 ethers.js
//创建 main函数
    
//运行 main函数

const { config } = require("dotenv");
const { ethers } = require("hardhat")

async function main() {
    //创建合约工厂
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    //通过工厂去部署合约
    const fundMe = await fundMeFactory.deploy(300)
    await fundMe.waitForDeployment()
    console.log(`合约部署完成，合约地址  ${fundMe.target}`);

    //验证合约
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        console.log("需等待五个区块")
        await fundMe.deploymentTransaction().wait(5);
        verifyFundMe(fundMe.target,[300]);
    }else{
        console.log("验证已跳过……")
    }

    // 初始化两个账户
    const [firstAccount,secondAccount] = await ethers.getSigners()
    // 用第一个账户充值合约 
    const fundTx = await fundMe.fund({value: ethers.parseEther("0.5")})
    await fundTx.wait()
    // 检查合约余额
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`合约余额为：${balanceOfContract}`)
    // 用第二个账户充值合约
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.5")})
    await fundTxWithSecondAccount.wait()
    // 检查合约余额
    const balanceOfContractAfterSecondAccount = await ethers.provider.getBalance(fundMe.target)
    console.log(`合约余额为：${balanceOfContractAfterSecondAccount}`)
    // 检查funderToAmount
    const firstAccountbalanceInFundMe = await fundMe.funderToAmount(firstAccount.address)
    const secondAccountbalanceInFundMe = await fundMe.funderToAmount(secondAccount.address)
    console.log(`第一个账户 ${firstAccount.address} 的余额是 ${firstAccountbalanceInFundMe} `)
    console.log(`第二个账户 ${secondAccount.address} 的余额是 ${secondAccountbalanceInFundMe} `)
}

async function verifyFundMe(fundMeAddr,args) {
    await hre.run("verify:verify",{
        address: fundMeAddr,
        constructorArguments: [args],
    });
}

main().then().catch((error) => {
    console.error(error)
    process.exit(0)
})