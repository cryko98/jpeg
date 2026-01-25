import React from 'react';
import { Button98 } from '../ui/Button98';
import { APP_CONSTANTS } from '../../types';

export const HowToBuyContent: React.FC = () => {
  return (
    <div className="bg-white p-6 h-full text-black font-mono overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 border-b-2 border-black pb-2">HOW_TO_BUY.TXT</h2>
      
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="text-4xl">1.</div>
          <div>
            <h3 className="font-bold text-xl mb-1">Create a Wallet</h3>
            <p className="text-sm">Download Phantom or your preferred Solana wallet extension.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-4xl">2.</div>
          <div>
            <h3 className="font-bold text-xl mb-1">Get SOL</h3>
            <p className="text-sm">Buy SOL from an exchange and send it to your wallet.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-4xl">3.</div>
          <div>
            <h3 className="font-bold text-xl mb-1">Go to Pump.fun</h3>
            <p className="text-sm">Click the button below to visit the official page.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-4xl">4.</div>
          <div>
            <h3 className="font-bold text-xl mb-1">Swap SOL for {APP_CONSTANTS.TICKER}</h3>
            <p className="text-sm">Select an amount and click buy. Confirm transaction.</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 border-2 border-gray-400 border-dashed text-center">
            <p className="mb-2 font-bold text-red-600">CA: {APP_CONSTANTS.CA}</p>
            <a href={`https://pump.fun/${APP_CONSTANTS.CA}`} target="_blank" rel="noreferrer">
                <Button98 className="w-full font-bold py-2">
                    🚀 LAUNCH PUMP.FUN
                </Button98>
            </a>
        </div>
      </div>
    </div>
  );
};