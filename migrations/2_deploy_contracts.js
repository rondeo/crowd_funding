var Funding_control = artifacts.require("./Funding_control.sol");

module.exports = function(deployer) {
  deployer.deploy(Funding_control);
};