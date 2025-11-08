// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

contract Escrow is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    address public seller;
    address public operator;
    address public factoryCreator;
    IERC20 public immutable token;
    uint8 public immutable tokenDecimals;

    uint256 public unitPrice;
    uint256 public unitsNeeded;
    uint256 public dueTimestamp;

    bool public fulfilled;
    bool public cancelled;
    bool public closed;

    uint256 public totalUnitsCommitted;
    uint256 public totalTokenEscrowed;

    mapping(address => uint256) public buyerUnits;
    mapping(address => uint256) public buyerPaid;

    event Contributed(address indexed buyer, uint256 units, uint256 amount);
    event Fulfilled(uint256 totalUnits, uint256 totalTokens);
    event RateRevised(uint256 newUnitPrice, uint256 newDueTimestamp);
    event ReleasedToSeller(uint256 amount);
    event RefundWithdrawn(address indexed buyer, uint256 amount);
    event Cancelled();
    event Closed();

    modifier onlySeller() {
        require(msg.sender == seller, "ONLY_SELLER");
        _;
    }
    modifier onlyOperator() {
        require(msg.sender == operator, "ONLY_OPERATOR");
        _;
    }
    modifier notCancelled() {
        require(!cancelled, "CANCELLED");
        _;
    }
    modifier notClosed() {
        require(!closed, "CLOSED");
        _;
    }

    constructor(
        address _seller,
        address _token,
        uint256 _unitPrice,
        uint256 _unitsNeeded,
        uint256 _dueTimestamp,
        address _operator,
        address _factoryCreator
    ) {
        seller = _seller;
        token = IERC20(_token);
        tokenDecimals = IERC20Metadata(_token).decimals();
        unitPrice = _unitPrice;
        unitsNeeded = _unitsNeeded;
        dueTimestamp = _dueTimestamp;
        operator = _operator;
        factoryCreator = _factoryCreator;
    }

    function contribute(
        uint256 units
    ) external nonReentrant whenNotPaused notCancelled notClosed {
        require(block.timestamp <= dueTimestamp, "DEADLINE");
        uint256 amount = units * unitPrice;
        token.safeTransferFrom(msg.sender, address(this), amount);

        buyerUnits[msg.sender] += units;
        buyerPaid[msg.sender] += amount;
        totalUnitsCommitted += units;
        totalTokenEscrowed += amount;

        emit Contributed(msg.sender, units, amount);
    }

    function finalizeAfterDue()
        external
        nonReentrant
        whenNotPaused
        notCancelled
        notClosed
    {
        require(block.timestamp > dueTimestamp, "TOO_EARLY");
        if (totalUnitsCommitted >= unitsNeeded) {
            fulfilled = true;
            emit Fulfilled(totalUnitsCommitted, totalTokenEscrowed);
        }
    }

    function reviseRate(
        uint256 newUnitPrice,
        uint256 newDueTimestamp
    ) external onlySeller whenNotPaused {
        require(!fulfilled && block.timestamp > dueTimestamp, "CANNOT_REVISE");
        unitPrice = newUnitPrice;
        dueTimestamp = newDueTimestamp;
        emit RateRevised(newUnitPrice, newDueTimestamp);
    }

    function releaseToSeller(
        uint256 amount
    ) external nonReentrant onlyOperator whenNotPaused {
        require(fulfilled, "NOT_FULFILLED");
        require(amount <= totalTokenEscrowed, "EXCEEDS_ESCROW");
        totalTokenEscrowed -= amount;
        token.safeTransfer(seller, amount);
        emit ReleasedToSeller(amount);
    }

    function cancelAndRefund() external {
        require(!fulfilled, "ALREADY_FULFILLED");
        require(msg.sender == seller || msg.sender == operator, "NOT_ALLOWED");
        cancelled = true;
        emit Cancelled();
    }

    function withdrawRefund() external nonReentrant whenNotPaused {
        require(
            cancelled || (!fulfilled && block.timestamp > dueTimestamp),
            "NO_REFUND"
        );
        uint256 paid = buyerPaid[msg.sender];
        require(paid > 0, "ZERO_BAL");
        buyerPaid[msg.sender] = 0;
        buyerUnits[msg.sender] = 0;
        totalTokenEscrowed -= paid;
        token.safeTransfer(msg.sender, paid);
        emit RefundWithdrawn(msg.sender, paid);
    }

    function close() external onlyOperator {
        require(totalTokenEscrowed == 0, "FUNDS_REMAIN");
        closed = true;
        emit Closed();
    }
}
