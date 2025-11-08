// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Escrow.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EscrowFactory is Ownable {
    event EscrowCreated(
        address indexed escrow,
        address indexed seller,
        string productId
    );

    address public operator;
    IERC20 public immutable token;
    address[] public allEscrows;

    constructor(address _token, address _operator) Ownable(msg.sender) {
        require(
            _token != address(0) && _operator != address(0),
            "INVALID_ARGS"
        );
        token = IERC20(_token);
        operator = _operator;
    }

    function setOperator(address newOperator) external onlyOwner {
        operator = newOperator;
    }

    function createEscrow(
        address seller,
        string calldata productId,
        uint256 unitPrice,
        uint256 unitsNeeded,
        uint256 dueTimestamp
    ) external returns (address) {
        Escrow e = new Escrow(
            seller,
            address(token),
            unitPrice,
            unitsNeeded,
            dueTimestamp,
            operator,
            msg.sender
        );
        address escrowAddr = address(e);
        allEscrows.push(escrowAddr);
        emit EscrowCreated(escrowAddr, seller, productId);
        return escrowAddr;
    }

    function getEscrowsCount() external view returns (uint256) {
        return allEscrows.length;
    }
}
