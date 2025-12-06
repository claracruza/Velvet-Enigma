"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/web";

type GamePhase = "idle" | "selecting" | "submitting" | "waiting_decrypt" | "decrypting" | "result";

interface GameState {
  phase: GamePhase;
  selectedNumber: number | null;
  gameId: bigint | null;
  resultHandle: string | null;
  userGuessHandle: string | null;
  systemNumHandle: string | null;
  result: boolean | null;
  userGuess: number | null;
  systemNum: number | null;
  error: string | null;
}

// Official Sepolia FHEVM configuration (from Zama docs)
const FHEVM_CONFIG = {
  chainId: 11155111,
  gatewayChainId: 10901,
  relayerUrl: "https://relayer.testnet.zama.org",
  network: "https://ethereum-sepolia-rpc.publicnode.com",
  aclContractAddress: "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D",
  kmsContractAddress: "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A",
  inputVerifierContractAddress: "0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0",
  verifyingContractAddressDecryption: "0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478",
  verifyingContractAddressInputVerification: "0x483b9dE06E4E4C7D35CCf5837A1668487406D955",
};

export default function GameSection() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<GameState>({
    phase: "idle",
    selectedNumber: null,
    gameId: null,
    resultHandle: null,
    userGuessHandle: null,
    systemNumHandle: null,
    result: null,
    userGuess: null,
    systemNum: null,
    error: null,
  });

  const [sdkReady, setSdkReady] = useState(false);
  const fhevmInstanceRef = useRef<FhevmInstance | null>(null);

  // Initialize FHEVM SDK
  useEffect(() => {
    const initializeSDK = async () => {
      if (typeof window === "undefined") return;
      if (fhevmInstanceRef.current) return;
      
      try {
        const { createInstance, initSDK } = await import("@zama-fhe/relayer-sdk/web");
        await initSDK();
        const instance = await createInstance(FHEVM_CONFIG);
        fhevmInstanceRef.current = instance;
        setSdkReady(true);
      } catch {
        setState(prev => ({ ...prev, error: "Failed to initialize FHE SDK" }));
      }
    };
    
    initializeSDK();
  }, []);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

  const resetGame = useCallback(() => {
    setState({
      phase: "idle",
      selectedNumber: null,
      gameId: null,
      resultHandle: null,
      userGuessHandle: null,
      systemNumHandle: null,
      result: null,
      userGuess: null,
      systemNum: null,
      error: null,
    });
  }, []);

  const handleNumberSelect = (num: number) => {
    if (state.phase === "idle" || state.phase === "selecting") {
      setState((prev) => ({ ...prev, phase: "selecting", selectedNumber: num }));
    }
  };

  const handlePlay = async () => {
    if (!state.selectedNumber || !walletClient || !publicClient || !address) {
      return;
    }

    const instance = fhevmInstanceRef.current;
    if (!instance) {
      setState(prev => ({ ...prev, error: "SDK not initialized" }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, phase: "submitting", error: null }));

      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add8(state.selectedNumber);
      const encryptedInput = await input.encrypt();
      
      const handleHex = ("0x" + Array.from(encryptedInput.handles[0])
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")) as `0x${string}`;
      const proofHex = ("0x" + Array.from(encryptedInput.inputProof)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")) as `0x${string}`;
      
      const { encodeFunctionData } = await import("viem");
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "play",
        args: [handleHex, proofHex],
      });
      
      const hash = await walletClient.sendTransaction({
        to: CONTRACT_ADDRESS as `0x${string}`,
        data,
        gas: BigInt(5000000),
      });

      await publicClient.waitForTransactionReceipt({ hash });

      const gameCount = (await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "gameCount",
      })) as bigint;

      const handles = (await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "getHandles",
        args: [gameCount],
      })) as [string, string, string];

      setState((prev) => ({
        ...prev,
        phase: "waiting_decrypt",
        gameId: gameCount,
        resultHandle: handles[0],
        userGuessHandle: handles[1],
        systemNumHandle: handles[2],
      }));
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        phase: "idle",
        error: err instanceof Error ? err.message : "Transaction failed",
      }));
    }
  };

  const handleDecrypt = async () => {
    if (!state.resultHandle || !walletClient || !address) {
      return;
    }

    const instance = fhevmInstanceRef.current;
    if (!instance) {
      setState(prev => ({ ...prev, error: "SDK not initialized" }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, phase: "decrypting", error: null }));

      const handles = [
        { handle: state.resultHandle, contractAddress: CONTRACT_ADDRESS },
        { handle: state.userGuessHandle!, contractAddress: CONTRACT_ADDRESS },
        { handle: state.systemNumHandle!, contractAddress: CONTRACT_ADDRESS },
      ];

      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 1;
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );

      const signature = await walletClient.signTypedData({
        account: address,
        domain: {
          ...eip712.domain,
          verifyingContract: eip712.domain.verifyingContract as `0x${string}`,
        },
        primaryType: "UserDecryptRequestVerification",
        types: {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        message: eip712.message as Record<string, unknown>,
      });

      const decryptedResults = await instance.userDecrypt(
        handles,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        address,
        startTimestamp,
        durationDays
      );

      const results = decryptedResults as Record<string, boolean | bigint | number>;
      const normalizeHandle = (h: string) => h.toLowerCase();
      const resultKey = normalizeHandle(state.resultHandle);
      const userGuessKey = normalizeHandle(state.userGuessHandle!);
      const systemNumKey = normalizeHandle(state.systemNumHandle!);

      const isMatch = results[resultKey] === true || 
                      results[resultKey] === 1n ||
                      results[resultKey] === 1;
      const userGuessValue = Number(results[userGuessKey]);
      const systemNumValue = Number(results[systemNumKey]);

      setState((prev) => ({
        ...prev,
        phase: "result",
        result: isMatch,
        userGuess: userGuessValue,
        systemNum: systemNumValue,
      }));
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        phase: "waiting_decrypt",
        error: err instanceof Error ? err.message : "Decryption failed",
      }));
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400 text-xl">Connect your wallet to play</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-3xl tracking-wider text-gold-100 mb-2">
          CIPHER GUESS
        </h2>
        <p className="text-neutral-500 text-sm tracking-wide">
          Select a number • Encrypted on-chain • Reveal with signature
        </p>
        {!sdkReady && (
          <p className="text-amber-500 text-xs mt-2 animate-pulse">Loading FHE SDK...</p>
        )}
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
          >
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Number Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-4 gap-4 mb-8"
      >
        {numbers.map((num) => (
          <motion.button
            key={num}
            onClick={() => handleNumberSelect(num)}
            disabled={state.phase !== "idle" && state.phase !== "selecting"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              aspect-square text-3xl font-light rounded-2xl transition-all duration-300 border
              ${
                state.selectedNumber === num
                  ? "bg-gradient-to-br from-amber-500/30 to-amber-600/20 border-amber-500/50 text-amber-300"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
              }
              ${state.phase !== "idle" && state.phase !== "selecting" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {num}
          </motion.button>
        ))}
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-6">
        {(state.phase === "idle" || state.phase === "selecting") && (
          <motion.button
            onClick={handlePlay}
            disabled={!state.selectedNumber || !sdkReady}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-12 py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
              state.selectedNumber && sdkReady
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            Play
          </motion.button>
        )}

        {state.phase === "submitting" && (
          <div className="flex items-center gap-3 text-amber-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full"
            />
            <span>Encrypting on-chain...</span>
          </div>
        )}

        {state.phase === "waiting_decrypt" && (
          <motion.button
            onClick={handleDecrypt}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-12 py-4 rounded-xl font-medium text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300"
          >
            🔓 Decrypt Result
          </motion.button>
        )}

        {state.phase === "decrypting" && (
          <div className="flex items-center gap-3 text-emerald-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full"
            />
            <span>Decrypting with signature...</span>
          </div>
        )}

        {state.phase === "result" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div
              className={`text-6xl mb-4 ${
                state.result ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {state.result ? "🎉" : "💔"}
            </div>
            <div
              className={`text-2xl font-display tracking-wider mb-4 ${
                state.result ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {state.result ? "YOU WIN!" : "TRY AGAIN"}
            </div>
            <div className="text-neutral-400 space-y-1 mb-6">
              <p>Your guess: <span className="text-white">{state.userGuess}</span></p>
              <p>System number: <span className="text-white">{state.systemNum}</span></p>
            </div>
            <motion.button
              onClick={resetGame}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
            >
              Play Again
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Game Info */}
      {state.gameId && state.phase !== "result" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <p className="text-neutral-500 text-sm">
            Game #{state.gameId.toString()} • Encrypted data stored on Sepolia
          </p>
        </motion.div>
      )}

      {/* Reset Button - Always visible */}
      {state.phase !== "idle" && state.phase !== "selecting" && (
        <motion.button
          onClick={resetGame}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 px-6 py-2 rounded-lg text-sm text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
        >
          ↻ Start Over
        </motion.button>
      )}
    </div>
  );
}
