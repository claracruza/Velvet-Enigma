"use client";

import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import GameSection from "@/components/GameSection";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col">
        <div className="w-full px-8 py-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-gold-500/30 flex items-center justify-center">
              <span className="font-display text-gold-400 text-2xl">V</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl tracking-[0.25em] text-gold-100 uppercase leading-none">Velvet</span>
              <span className="font-body text-[0.6rem] tracking-[0.4em] text-gold-500/60 uppercase mt-1">Enigma</span>
            </div>
          </div>
        </div>
        <div className="flex-1" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {!isConnected ? (
          <HeroSection />
        ) : (
          <GameSection />
        )}
      </div>

      <Footer />
    </main>
  );
}
