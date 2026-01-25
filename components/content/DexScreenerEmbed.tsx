import React from 'react';
import { APP_CONSTANTS } from '../../types';

export const DexScreenerEmbed: React.FC = () => {
  return (
    <div className="w-full h-full bg-black flex flex-col">
       <iframe 
        src={`https://dexscreener.com/solana/${APP_CONSTANTS.CA}?embed=1&theme=dark&trades=0&info=0`}
        width="100%" 
        height="100%" 
        style={{ border: 0 }}
        title="DexScreener"
      ></iframe>
    </div>
  );
};
