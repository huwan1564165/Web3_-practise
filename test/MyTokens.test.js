import { expect } from "chai";

describe("MyTokens 合约测试", function () {
  let MyTokens;
  let myTokens;
  let owner, addr1;

  beforeEach(async function () {
    // 获取测试账户
    [owner, addr1] = await ethers.getSigners();
    
    // 部署合约
    MyTokens = await ethers.getContractFactory("MyTokens");
    myTokens = await MyTokens.deploy("My Token", "MTK");
  });

  it("测试部署时应正确设置管理员和初始供应量", async function () {
    // 检查管理员
    expect(await myTokens.owner()).to.equal(owner.address);
    
    // 检查初始供应量 1000 个代币
    const ownerBalance = await myTokens.balanceOf(owner.address);
    expect(ownerBalance).to.equal(1000n * 10n ** 18n); // 1000 * 10^18
  });

  it("测试是否只有管理员可以铸币", async function () {
    // 管理员铸币应该成功
    await myTokens.mint(addr1.address, 100);
    expect(await myTokens.balanceOf(addr1.address)).to.equal(100);

    // 非管理员铸币应该失败
    await expect(
      myTokens.connect(addr1).mint(addr1.address, 100)
    ).to.be.revertedWith("你不是管理员，没有铸币权限");
  });

  it("测试转账功能", async function () {
    // 从管理员转账给 addr1
    await myTokens.transfer(addr1.address, 100);
    expect(await myTokens.balanceOf(addr1.address)).to.equal(100);
    expect(await myTokens.balanceOf(owner.address)).to.equal(1000n * 10n ** 18n - 100n);
  });

  it("测试是否只有管理员可以强制销毁", async function () {
    // 先给 addr1 一些代币
    await myTokens.transfer(addr1.address, 100);
    
    // 管理员可以强制销毁
    await myTokens.burnFrom(addr1.address, 50);
    expect(await myTokens.balanceOf(addr1.address)).to.equal(50);

    // 非管理员不能强制销毁
    await expect(
      myTokens.connect(addr1).burnFrom(owner.address, 50)
    ).to.be.revertedWith("你不是管理员，没有销毁权限");
  });
});