"use client";

export function Footer() {
  return (
    <footer className="w-full px-8 py-6 border-t border-gold-500/10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs tracking-[0.15em] text-champagne/30 uppercase">
          Powered by FHEVM
        </p>
        
        <div className="flex items-center gap-6">
          <a
            href="https://docs.zama.org/protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-wider text-champagne/40 hover:text-gold-400 transition-colors"
          >
            Documentation
          </a>
          <span className="text-champagne/20">|</span>
          <span className="text-xs tracking-wider text-champagne/40">
            Sepolia Testnet
          </span>
        </div>
      </div>
    </footer>
  );
}

