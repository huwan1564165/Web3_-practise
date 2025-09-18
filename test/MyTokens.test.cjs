const {expect} = require("chai")
const { ethers } = require("hardhat")

//我用AI帮我写了一份测试指南(就是注释)，我是根据注释一步步写的代码


describe("测试MyTokens合约",async function(){
    let owner,addr1,addr2
    let MyTokens
    let myTokens
    beforeEach(async function () {
        //获取测试用户
        [owner,addr1,addr2] =await ethers.getSigners();
        //创建合约工厂
        MyTokens=await ethers.getContractFactory("MyTokens");
        //通过合约工厂部署MyTokens合约
        myTokens=await MyTokens.deploy("My Tokens","MT");
        await myTokens.waitForDeployment();
    })
    // 1. 合约部署初始化测试
    it("合约部署初始化测试",async function(){
        //验证代币名称和符号是否正确设置
        expect(await myTokens.name()).to.equal("My Tokens");
        expect(await myTokens.symbol()).to.equal("MT");
        // 检查合约部署者是否被正确设置为管理员
        expect(await myTokens.owner()).to.equal(owner.address);
        // 确认初始代币供应量是否正确分配
        expect(await myTokens.totalSupply()).to.equal(1000n*10n**18n);
        // 验证代币精度（decimals）是否为标准18位
        expect(await myTokens.decimals()).to.equal(18);
    })
    // 2. 管理员权限测试
    it("管理员权限测试",async function(){
        // 测试管理员铸币功能是否正常工作
        await myTokens.mint(addr1.address,100);
        expect(await myTokens.balanceOf(addr1.address)).to.equal(100);

        // 验证非管理员账户尝试铸币是否被正确拒绝
        // 检查错误信息是否准确提示权限不足
        await expect(myTokens.connect(addr1).mint(addr1.address,100))
            .to.be.revertedWith("你不是管理员，没有铸币权限");
    })
    

    // 3. 代币转账功能测试
    it("代币转账功能测试",async function(){
        // 测试正常的代币转账操作
        await myTokens.transfer(addr1.address,100);
        // 验证转账后余额计算是否正确
        expect(await myTokens.balanceOf(addr1.address)).to.equal(100);
        expect(await myTokens.balanceOf(owner.address)).to.equal((1000n*10n**18n)-100n)
    })
    
    // 4. 强制销毁功能测试
    it("强制销毁功能测试",async function(){
        // 测试管理员强制销毁他人代币的权限
        //addr1账户上现在没有token，需要给他一些
        await myTokens.transfer(addr1.address,100);
        await myTokens.burnFrom(addr1.address,50);
        expect(await myTokens.balanceOf(addr1.address)).to.equal(50);
        // 验证非管理员尝试强制销毁是否被拒绝
        await expect(myTokens.connect(addr1).burnFrom(owner.address,100))
            .to.be.revertedWith("你不是管理员，没有销毁权限");
        // 检查销毁后余额更新是否正确
        expect(await myTokens.balanceOf(addr1.address)).to.equal(50)
        expect(await myTokens.balanceOf(owner.address)).to.equal((1000n*10n**18n)-100n)
    })
    

    // 5. ERC20标准功能测试
    it("ERC20标准功能测试",async function(){
        // 测试余额查询功能
        //addr1账户上现在没有token，需要给他一些
        await myTokens.transfer(addr1.address,100);
        expect(await myTokens.balanceOf(addr1.address)).to.equal(100);
        expect(await myTokens.balanceOf(owner.address)).to.equal((1000n*10n**18n)-100n);
        // 验证授权和代扣机制
        await myTokens.approve(addr1.address,1000);
        expect(await myTokens.allowance(owner.address,addr1.address)).to.equal(1000);
        await myTokens.connect(addr1).transferFrom(owner.address,addr2.address,200);
        expect(await myTokens.allowance(owner.address,addr1.address)).to.equal(800);
        expect(await myTokens.balanceOf(addr2.address)).to.equal(200);
        expect(await myTokens.balanceOf(owner.address)).to.equal((1000n*10n**18n)-300n);
        // 检查总额供应量是否正确
        expect(await myTokens.totalSupply()).to.equal(1000n*10n**18n);
    })
    
})