"use client";

import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "./ConnectButton";
import { useState, useEffect } from "react";

export function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="w-full px-8 py-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-4 group cursor-default">
        <div className="w-12 h-12 border border-gold-500/30 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:border-gold-400/60">
          <div className="absolute inset-0 bg-gold-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <span className="font-display text-gold-400 text-2xl relative z-10 group-hover:text-gold-200 transition-colors">V</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-xl tracking-[0.25em] text-gold-100 uppercase leading-none">
            Velvet
          </span>
          <span className="font-body text-[0.6rem] tracking-[0.4em] text-gold-500/60 uppercase mt-1 group-hover:text-gold-400 transition-colors">
            Enigma
          </span>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="flex items-center gap-4">
        {mounted && isConnected && address ? (
          <div className="flex items-center gap-4 bg-white/5 px-1 py-1 rounded-full border border-white/5 backdrop-blur-sm">
            <div className="px-5 py-2 bg-obsidian/50 rounded-full border border-white/5">
              <span className="font-body text-xs tracking-wider text-gold-300">
                {formatAddress(address)}
              </span>
            </div>
            <button
              onClick={() => disconnect()}
              className="px-6 py-2 font-body text-xs tracking-[0.15em] uppercase text-white/40 hover:text-gold-300 transition-colors mr-2"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <ConnectButton />
        )}
      </div>
    </header>
  );
}
