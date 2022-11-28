const { ethers } = require("hardhat");
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

const ethernal = require('hardhat-ethernal');

const namehash = require('eth-ens-namehash');
const sha3 = require('web3-utils').sha3;

module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const ans = await ethers.getContract('ANSRegistry')

    await deploy('BaseRegistrarImplementation', {
        from: deployer, 
        args: [ans.address, namehash.hash('arb')],
        log: true
    })

    const base = await ethers.getContract('BaseRegistrarImplementation');

    const transactions = []
    transactions.push(await base.addController(owner, {from: deployer}))
    transactions.push(await ans.setSubnodeOwner(ZERO_HASH, sha3('arb'), base.address))

    console.log(`Waiting on ${transactions.length} transactions setting base registrar`);
    await Promise.all(transactions.map((tx) => tx.wait()));
}


module.exports.tags = ['baseregistrar'];
module.exports.dependencies = ['registry']