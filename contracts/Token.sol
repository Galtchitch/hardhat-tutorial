//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract TokenV2 {  // Изменили имя контракта!
    string public name = "New Crypto Token V2";
    string public symbol = "NCTv2";
    uint256 public totalSupply = 5000000 * 10**18; // Добавили decimals (18 знаков)
    
    address public owner;
    mapping(address => uint256) balances;
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor() {
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough tokens");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
    
    function mint(address recipient, uint256 amount) external {
        require(msg.sender == owner, "Only owner can mint");
        totalSupply += amount;
        balances[recipient] += amount;
        emit Transfer(address(0), recipient, amount);
    }
}