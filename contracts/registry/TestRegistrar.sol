pragma solidity >=0.8.4;

import "./ANS.sol";

/**
 * A registrar that allocates subdomains to the first person to claim them, but
 * expires registrations a fixed period after they're initially claimed.
 */
contract TestRegistrar {
    uint constant registrationPeriod = 4 weeks;

    ANS public ans;
    bytes32 public rootNode;
    mapping (bytes32 => uint) public expiryTimes;

    /**
     * Constructor.
     * @param ansAddr The address of the ANS registry.
     * @param node The node that this registrar administers.
     */
    constructor(ANS ansAddr, bytes32 node) public {
        ans = ansAddr;
        rootNode = node;
    }

    /**
     * Register a name that's not currently registered
     * @param label The hash of the label to register.
     * @param owner The address of the new owner.
     */
    function register(bytes32 label, address owner) public {
        require(expiryTimes[label] < block.timestamp);

        expiryTimes[label] = block.timestamp + registrationPeriod;
        ans.setSubnodeOwner(rootNode, label, owner);
    }
}
