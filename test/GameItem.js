const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
  it("Should return name after deployment", async function () {
    const myNftContract = await ethers.deployContract("GameItem");
    const deployedName = await myNftContract.name();
    expect(deployedName).to.equal("GameItem");
  });

  it("Should award an item to player", async function () {
    const [ player_0, player_1 ] = await ethers.getSigners();

    // Deploy the MyNFT contract
    const myNftContract = await ethers.deployContract("GameItem");

    // Award an item to the owner
    const tokenUri = "https://bafybeifdpy3ikwpysuu7gvur232wv2ttzff55warsbpqdqku5hzaejw3ym.ipfs.dweb.link?filename=thor_hammer.txt";
    const testUri = "Just a test";

    await myNftContract.awardItem(player_0.address, tokenUri);
    await myNftContract.awardItem(player_1.address, testUri);

    // Check ownership
    expect(await myNftContract.ownerOf(0)).to.equal(player_0.address);
    expect(await myNftContract.ownerOf(1)).to.equal(player_1.address);

    // The token URI should be the same as the one we set earlier   
    expect(await myNftContract.tokenURI(0)).to.equal(tokenUri);
    expect(await myNftContract.tokenURI(1)).to.equal(testUri);

  });
});