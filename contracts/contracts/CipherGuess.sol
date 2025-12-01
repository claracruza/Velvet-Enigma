// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { externalEuint8 } from "encrypted-types/EncryptedTypes.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title CipherGuess - FHE Number Guessing Game
/// @notice TRUE end-to-end encryption: frontend encrypts → contract computes → frontend decrypts
/// @dev No plaintext ever exposed on-chain
contract CipherGuess is ZamaEthereumConfig {
    
    uint256 public gameCount;
    
    struct Game {
        address player;
        euint8 encryptedUserGuess;   // User's guess (encrypted in frontend)
        euint8 encryptedSystemNum;   // System's encrypted random (1-8)
        ebool encryptedResult;       // Encrypted comparison result
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
    
    /// @notice Play the game with frontend-encrypted guess
    /// @param encryptedGuess User's encrypted number (from frontend SDK)
    /// @param inputProof Proof for the encrypted input
    function play(externalEuint8 encryptedGuess, bytes calldata inputProof) external returns (uint256 gameId) {
        gameId = ++gameCount;
        
        // 1. Convert frontend-encrypted input to on-chain euint8
        // This verifies the encryption proof - NO PLAINTEXT EXPOSED
        euint8 userGuess = FHE.fromExternal(encryptedGuess, inputProof);
        
        // 2. Generate system's encrypted random number (1-8)
        // FHE.randEuint8(8) returns [0,7], add 1 for [1,8]
        euint8 systemNum = FHE.add(FHE.randEuint8(8), FHE.asEuint8(1));
        
        // 3. Encrypted comparison - ALL IN CIPHERTEXT
        ebool isMatch = FHE.eq(userGuess, systemNum);
        
        // 4. Grant decryption permission to player AND contract
        FHE.allow(isMatch, msg.sender);
        FHE.allow(userGuess, msg.sender);
        FHE.allow(systemNum, msg.sender);
        FHE.allow(isMatch, address(this));
        FHE.allow(userGuess, address(this));
        FHE.allow(systemNum, address(this));
        
        // 5. Store game
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
    
    /// @notice Get handles for user decryption
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
    
    /// @notice Get game metadata
    function getGame(uint256 gameId) external view returns (
        address player,
        bool isComplete
    ) {
        Game storage g = games[gameId];
        return (g.player, g.isComplete);
    }
}
