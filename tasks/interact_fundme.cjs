const {task} = require("hardhat/config")

task("interact-fundme","与fundme合约交互").addParam("addr","fundme contract address").setAction(async(taskArgs,hre) => {
    const FundMe = await ethers.getContractFactory("FundMe")
    const fundMe = await FundMe.attach(taskArgs.addr)
    
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
})