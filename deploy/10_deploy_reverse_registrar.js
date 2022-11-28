const { namehash } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
const ZERO_ADDRESS="0x0000000000000000000000000000000000000000";

const sha3 = require('web3-utils').sha3;

module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const ans = await ethers.getContract('ANSRegistry')
    const resolver = await ethers.getContract('PublicResolver')

    await deploy('ReverseRegistrar', {
        from: deployer, 
        args: [ans.address, resolver.address],
        log: true
    })


    const reverseRegistrar = await ethers.getContract('ReverseRegistrar')
    const transactions = []

    const mainOwner = await ans.owner(ZERO_HASH)
    console.log(mainOwner)

    transactions.push(await ans.setSubnodeOwner(ZERO_HASH, sha3('reverse'), owner ));
    transactions.push(await ans.setSubnodeOwner(namehash('reverse'), sha3('addr'), reverseRegistrar.address))
    transactions.push(await ans.setOwner(namehash('reverse'), ZERO_ADDRESS))
    // ESTIMATE GAS -->
    console.log(`Waiting on settings to take place on reverse-registrar ${transactions.length}`)
    await Promise.all(transactions.map((tx) => tx.wait()));



}
module.exports.tags = ['reverse-eth-registrar'];


module.exports.dependencies = ['registry', 'public-resolver']