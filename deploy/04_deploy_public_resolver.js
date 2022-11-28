const { ethers } = require("hardhat");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000"
const sha3 = require('web3-utils').sha3;
const namehash = require('eth-ens-namehash');
module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const ans = await ethers.getContract('ANSRegistry')

    await deploy('PublicResolver', {
        from: deployer, 
        args: [ans.address, ZERO_ADDRESS],
        log: true
    })

    const resolver = await ethers.getContract('PublicResolver')
    const ethregistrar = await ethers.getContract('ETHRegistrarController')
    const baseRegistrar = await ethers.getContract('BaseRegistrarImplementation');

    const transactions = []
    transactions.push(await ans.setSubnodeOwner(ZERO_HASH, sha3('arb'), owner))
    transactions.push(await ans.setResolver(namehash.hash('arb'), resolver.address))
    transactions.push(await resolver['setAddr(bytes32,address)'](namehash.hash('arb'), resolver.address))
    transactions.push(await resolver.setInterface(namehash.hash('arb'), "0x018fac06", ethregistrar.address))
    transactions.push(await ans.setSubnodeOwner(ZERO_HASH,sha3('arb'),baseRegistrar.address));
    console.log(`Waiting on settings to take place on resolvers ${transactions.length}`)
    await Promise.all(transactions.map((tx) => tx.wait()));    
}

module.exports.tags = ['public-resolver'];
module.exports.dependencies = ['registry', 'baseregistrar', 'eth-registrar']