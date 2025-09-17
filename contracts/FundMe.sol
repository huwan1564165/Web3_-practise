// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//1. 创建一个收款函数
//2.记录投资人并且查看
//3.在锁定期内，达到目标值，生产商可以提款
//4.在锁定期内，未达到目标值，投资人在锁定期以后退款

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe{
        mapping (address => uint256) public funderToAmount;

        uint256 constant MINIMUM_VALUE = 100*10**8;//USD

        AggregatorV3Interface internal dataFeed;

        //目标值
        uint256 constant TARGET = 1000 * 10 ** 8;

        address public owner;

        uint256 deploymentTimestamp;
        uint256 lockTime;

        address erc20Addr;

        bool public  getFundSuccess = false;

        constructor(uint256 _lockTime){
                //sepolia testnet
                dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
                owner = msg.sender;
                deploymentTimestamp=block.timestamp;
                lockTime = _lockTime;
        }

        function fund () external payable {
                require(convertEthToUsd(msg.value) >= MINIMUM_VALUE,"Send more ETH");
                require(block.timestamp < deploymentTimestamp + lockTime,"window is closed");
                funderToAmount[msg.sender]=msg.value;
        }

        function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
        }

        function convertEthToUsd(uint256 ethAmount) internal view  returns(uint256)  {
                uint256 ethPrice = uint256 (getChainlinkDataFeedLatestAnswer());
                return ethAmount * ethPrice / (10 ** 8);
        }

        function transferOwnership(address newOwner) public onlyOwner{
                owner = newOwner;

        }
        //提款函数
        function getFund() external  windowClosed onlyOwner{
                require(convertEthToUsd(address(this).balance) >= TARGET,"Target is not reached");
                //transfer: 发送失败时会自动回滚交易（revert）
                //payable(msg.sender).transfer(address(this).balance);
                //send:
                //call:
                bool success;
                (success,)=payable(msg.sender).call{value: address(this).balance}(""); 
                require(success,"transfer tx failed");
                funderToAmount[msg.sender]=0;
                getFundSuccess = true;
        }

        //退款函数
        function reFund() external windowClosed{
                require(convertEthToUsd(address(this).balance) < TARGET,"Target is reached");
                require(funderToAmount[msg.sender] != 0,"there is no fund for you");
                bool success;
                (success,)=payable(msg.sender).call{value: funderToAmount[msg.sender]}("");
                require(success,"transfer tx failed");
                funderToAmount[msg.sender]=0;
                getFundSuccess = true;
        }

        function setFundMeToAmount(address funder, uint256 amountToUpdate) external {
                require(msg.sender == erc20Addr,"you do not have permission to call this");
                funderToAmount[funder] = amountToUpdate;
        }

        function setErc20Addr( address _erc20Addr) public onlyOwner{
                erc20Addr = _erc20Addr;
        } 

        modifier windowClosed(){
                require(block.timestamp >= deploymentTimestamp + lockTime,"window is closed");
                _;
 
        }

        modifier onlyOwner(){
                require(msg.sender == owner,"this function can only be called by owner");
                _;
        }
    }




