pragma solidity >=0.8.4;

import "../registry/ANS.sol";
import "../registry/ReverseRegistrar.sol";

/**
 * @dev Provides a default implementation of a resolver for reverse records,
 * which permits only the owner to update it.
 */
contract DefaultReverseResolver {
    // namehash('addr.reverse')
    bytes32 constant ADDR_REVERSE_NODE = 0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2;

    ANS public ans;
    mapping (bytes32 => string) public name;

    /**
     * @dev Only permits calls by the reverse registrar.
     * @param node The node permission is required for.
     */
    modifier onlyOwner(bytes32 node) {
        require(msg.sender == ans.owner(node));
        _;
    }

    /**
     * @dev Constructor
     * @param ansAddr The address of the ANS registry.
     */
    constructor(ANS ansAddr) {
        ans = ansAddr;

        // Assign ownership of the reverse record to our deployer
        ReverseRegistrar registrar = ReverseRegistrar(ans.owner(ADDR_REVERSE_NODE));
        if (address(registrar) != address(0x0)) {
            registrar.claim(msg.sender);
        }
    }

    /**
     * @dev Sets the name for a node.
     * @param node The node to update.
     * @param _name The name to set.
     */
    function setName(bytes32 node, string memory _name) public onlyOwner(node) {
        name[node] = _name;
    }
}
