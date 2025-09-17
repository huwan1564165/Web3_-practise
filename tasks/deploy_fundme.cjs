const {task} = require("hardhat/config")

task("deploy-fundme","部署并验证fundme合约").setAction(async(taskArgs,hre) => {
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
})

async function verifyFundMe(fundMeAddr,args) {
    await hre.run("verify:verify",{
        address: fundMeAddr,
        constructorArguments: [args],
    });
}

module.exports = {}