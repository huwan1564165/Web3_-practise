const { ethers, deployments, getNamedAccounts } = require("hardhat")

describe("测试FundMe合约",async function () {
    let firstAccount
    let fundMe
    beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployments = deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployments)
    })

    it("测试部署者是否为msg.sender",async function () {
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()),firstAccount)
    })
    it("测试datafeed是否被正确赋值",async function () {
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.dataFeed()),"0x694AA1769357215DE4FAC081bf1f309aDC325306")
    })
})