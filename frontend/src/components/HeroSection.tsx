"use client";

import { motion } from "framer-motion";
import { ConnectButton } from "./ConnectButton";
import { Shield, Lock, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <div className="max-w-4xl mx-auto text-center relative z-10 pt-20">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 blur-[120px] -z-10 rounded-full pointer-events-none" />

      {/* Decorative top element */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="deco-line w-32 mx-auto mb-16"
      />

      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-7xl md:text-8xl lg:text-9xl tracking-tight text-gold-100 mb-8 leading-none"
      >
        <span className="block text-white/90 drop-shadow-2xl">Velvet</span>
        <span className="block text-gold-gradient font-italic mt-2">Enigma</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="font-body text-sm md:text-base tracking-[0.3em] text-gold-200/40 uppercase mb-16"
      >
        Encrypted Fortune Awaits
      </motion.p>

      {/* Decorative line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="deco-line w-64 mx-auto mb-16"
      />

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex justify-center gap-16 mb-20"
      >
        {[
          { Icon: Shield, label: "FHE Protected" },
          { Icon: Lock, label: "On-Chain" },
          { Icon: Sparkles, label: "Verifiable" }
        ].map(({ Icon, label }, i) => (
          <div key={label} className="flex flex-col items-center gap-4 group">
            <div className="w-16 h-16 border border-white/10 bg-white/5 flex items-center justify-center relative transition-all duration-500 group-hover:border-gold-500/40 group-hover:bg-gold-500/5">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_30px_rgba(212,175,55,0.2)]" />
              <Icon size={24} className="text-gold-500/60 group-hover:text-gold-300 transition-colors relative z-10" strokeWidth={1.5} />
            </div>
            <span className="text-[0.65rem] tracking-[0.2em] text-gold-100/30 uppercase group-hover:text-gold-300 transition-colors">
              {label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-20"
      >
        <ConnectButton />
        <p className="mt-8 text-xs tracking-[0.15em] text-white/20">
          Connect your wallet to begin
        </p>
      </motion.div>
    </div>
  );
}
