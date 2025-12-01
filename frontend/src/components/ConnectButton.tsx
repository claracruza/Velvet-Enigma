"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useConnect, Connector } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet } from "lucide-react";

export function ConnectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { connectors, connect, isPending } = useConnect();

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    setIsOpen(false);
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className="bg-[#121214] border border-gold-500/30 p-8 rounded-lg shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl text-gold-100">
                  Select Wallet
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-gold-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Decorative line */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mb-6" />

              {/* Wallet options */}
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => handleConnect(connector)}
                    disabled={isPending}
                    className="w-full flex items-center gap-4 p-4 border border-gold-500/20 bg-black/30 hover:border-gold-500/50 hover:bg-gold-500/10 transition-all duration-300 rounded-lg group"
                  >
                    <div className="w-10 h-10 border border-gold-500/30 rounded flex items-center justify-center group-hover:border-gold-500/60 transition-colors">
                      <Wallet size={18} className="text-gold-500/70 group-hover:text-gold-400" />
                    </div>
                    <span className="text-sm tracking-wider text-neutral-300 group-hover:text-white">
                      {connector.name}
                    </span>
                  </button>
                ))}
              </div>

              {isPending && (
                <p className="mt-6 text-center text-xs tracking-wider text-gold-500/60">
                  Connecting...
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-luxury">
        Connect Wallet
      </button>

      {typeof window !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
