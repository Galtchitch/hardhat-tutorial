const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenDeploy", (mbuilder) => {
    const player_0 = mbuilder.getAccount(0);     
    const erc721_smart_contract = mbuilder.contract("GameItem", [], {from: player_0});
    return { erc20_smart_contract: erc721_smart_contract };
  });
