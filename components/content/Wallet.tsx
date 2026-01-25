import React, { useState } from 'react';
import { APP_CONSTANTS } from '../../types';
import { Button98 } from '../ui/Button98';

export const WalletContent: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(APP_CONSTANTS.CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#c0c0c0] p-4 h-full flex flex-col items-center justify-center text-center">
      <div className="bg-white border-2 border-inset border-[#808080] p-6 max-w-full w-[400px] mb-4">
        <h3 className="text-xl font-bold mb-4 font-['Courier_New']">CONTRACT ADDRESS</h3>
        
        <div className="bg-gray-100 border border-gray-400 p-2 break-all font-mono text-sm mb-4 select-all cursor-text">
          {APP_CONSTANTS.CA}
        </div>

        <Button98 onClick={copyToClipboard} className="w-full flex justify-center items-center gap-2">
           {copied ? 'COPIED!' : 'COPY ADDRESS'} 
           <span className="text-lg">📋</span>
        </Button98>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
         <a href={`https://pump.fun/${APP_CONSTANTS.CA}`} target="_blank" rel="noreferrer" className="block">
            <Button98 className="w-full">Buy on Pump.fun</Button98>
         </a>
         <a href={`https://dexscreener.com/solana/${APP_CONSTANTS.CA}`} target="_blank" rel="noreferrer" className="block">
            <Button98 className="w-full">DexScreener</Button98>
         </a>
      </div>
      
      <div className="mt-6 text-sm">
        <p>1. Download Phantom Wallet</p>
        <p>2. Get some SOL</p>
        <p>3. Swap for {APP_CONSTANTS.TICKER}</p>
        <p>4. Hodl until Windows 99</p>
      </div>
    </div>
  );
};
