import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Governor", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function Governor() {


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, add3, add4, add5, add6, add7] = await ethers.getSigners();

    const GovernorToken = await ethers.getContractFactory("GovernorToken");
    const governorToken = await GovernorToken.deploy(owner.address);

    return { governorToken, owner, otherAccount, add3, add4, add5, add6, add7 };
  }

  describe("DELEGATES", function () {
    it("Checks Balance of Owner", async function () {
      const { governorToken, owner} = await loadFixture(Governor);
      const totalsupply = ethers.utils.parseUnits("10000000", "18");
      expect (await governorToken.balanceOf(owner.address)).to.equal(totalsupply); 
    });

    it("Transfers tokens from Owner to others",async function () {
      const { governorToken, owner, otherAccount, add3  } = await loadFixture(Governor);
      const transferAmount = ethers.utils.parseUnits("100", "18");
      await governorToken.transfer(add3.address,transferAmount);
    });

    it("Delegates votes and checks GetCurrentVotes",async function () {
      const { governorToken,otherAccount, add3, add4 } = await loadFixture(Governor);
      const transferAmount = ethers.utils.parseUnits("100", "18");
      await governorToken.transfer(add3.address,transferAmount);
      await governorToken.transfer(add4.address,transferAmount);
      const blockNumBefore = await ethers.provider.getBlockNumber();
      await governorToken.connect(add3).delegate(otherAccount.address);
      await governorToken.connect(add4).delegate(add3.address);
      const votes = await governorToken.getCurrentVotes(otherAccount.address);
      const votes2 = await governorToken.getCurrentVotes(add3.address);
      expect(await governorToken.balanceOf(add3.address)).of.equal(transferAmount);
      console.log("this is it ....", votes, votes2, blockNumBefore)
    });

    it("get votes of an account at a particular block",async function () {
      const { governorToken, owner, otherAccount, add3 ,add4 } = await loadFixture(Governor);
      const transferAmount = ethers.utils.parseUnits("100", "18");
      await governorToken.transfer(add3.address,transferAmount);
      await governorToken.transfer(add4.address,transferAmount);
      const blockNumBefore1 = await ethers.provider.getBlockNumber();
      await governorToken.connect(add3).delegate(otherAccount.address);
      const blockNumBefore3 = await ethers.provider.getBlockNumber();
      await governorToken.connect(add4).delegate(otherAccount.address);
      const blockNumBefore2 = await ethers.provider.getBlockNumber();
      const currentTime = await time.latest()
      console.log("Your old time is\n", currentTime);
      await time.increaseTo(currentTime + 20)
      const newCurrentTime = await time.latest()
      console.log("Your new time is\n", newCurrentTime);
      const blockNumBefore4 = await ethers.provider.getBlockNumber();
      const votes = await governorToken.getPriorVotes(add3.address,blockNumBefore2);
      console.log(blockNumBefore1, blockNumBefore2,blockNumBefore3,blockNumBefore4, votes);``
    });
  });

  
});
