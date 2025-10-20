// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScoreStore {
    mapping(address => uint256) public scores;
    
    event ScoreSaved(address indexed player, uint256 score);
    
    function saveScore(uint256 _score) external {
        require(_score > scores[msg.sender], "Score must be higher than current score");
        scores[msg.sender] = _score;
        emit ScoreSaved(msg.sender, _score);
    }
    
    function getScore(address _player) external view returns (uint256) {
        return scores[_player];
    }
}
