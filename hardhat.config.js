/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");

module.exports = {
  solidity: "0.8.28",
  paths: {
    artifacts: "./app/src/artifacts",
  }, 
};
