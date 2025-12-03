// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { externalEuint8 } from "encrypted-types/EncryptedTypes.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title VelvetEnigma - FHE Number Guessing Game
/// @notice TRUE end-to-end encryption: frontend encrypts → contract computes → frontend decrypts
/// @dev No plaintext ever exposed on-chain
contract VelvetEnigma is ZamaEthereumConfig {
    
    uint256 public gameCount;
    
    struct Game {
        address player;
        euint8 encryptedUserGuess;
        euint8 encryptedSystemNum;
        ebool encryptedResult;
        bool isComplete;
    }
    
    mapping(uint256 => Game) public games;
    
    event GamePlayed(
        uint256 indexed gameId, 
        address indexed player,
        bytes32 resultHandle,
        bytes32 userGuessHandle,
        bytes32 systemNumHandle
    );
    
    function play(externalEuint8 encryptedGuess, bytes calldata inputProof) external returns (uint256 gameId) {
        gameId = ++gameCount;
        
        euint8 userGuess = FHE.fromExternal(encryptedGuess, inputProof);
        euint8 systemNum = FHE.add(FHE.randEuint8(8), FHE.asEuint8(1));
        ebool isMatch = FHE.eq(userGuess, systemNum);
        
        FHE.allow(isMatch, msg.sender);
        FHE.allow(userGuess, msg.sender);
        FHE.allow(systemNum, msg.sender);
        FHE.allow(isMatch, address(this));
        FHE.allow(userGuess, address(this));
        FHE.allow(systemNum, address(this));
        
        games[gameId] = Game({
            player: msg.sender,
            encryptedUserGuess: userGuess,
            encryptedSystemNum: systemNum,
            encryptedResult: isMatch,
            isComplete: true
        });
        
        emit GamePlayed(
            gameId, 
            msg.sender, 
            FHE.toBytes32(isMatch),
            FHE.toBytes32(userGuess),
            FHE.toBytes32(systemNum)
        );
    }
    
    function getHandles(uint256 gameId) external view returns (
        bytes32 resultHandle,
        bytes32 userGuessHandle,
        bytes32 systemNumHandle
    ) {
        Game storage g = games[gameId];
        return (
            FHE.toBytes32(g.encryptedResult),
            FHE.toBytes32(g.encryptedUserGuess),
            FHE.toBytes32(g.encryptedSystemNum)
        );
    }
    
    function getGame(uint256 gameId) external view returns (
        address player,
        bool isComplete
    ) {
        Game storage g = games[gameId];
        return (g.player, g.isComplete);
    }
}

