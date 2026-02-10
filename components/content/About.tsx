import React from 'react';
import { APP_CONSTANTS } from '../../types';

export const AboutContent: React.FC = () => {
  return (
    <div className="bg-white p-6 h-full text-black font-sans border-2 border-[#808080] border-inset overflow-y-auto">
      <h2 className="text-3xl font-bold mb-4 font-['Courier_New'] text-center uppercase">WELCOME TO {APP_CONSTANTS.NAME}</h2>
      
      <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
        <video 
          src="https://wkkeyyrknmnynlcefugq.supabase.co/storage/v1/object/public/neww/VID_20260210_125930_387.mp4" 
          autoPlay 
          loop 
          muted 
          className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-[200px] h-[200px] object-cover"
        />
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            It is literally just a <span className="font-bold underline">.gif</span>. No utility, no roadmap, just an infinite loop on the blockchain.
          </p>
          <p className="text-lg leading-relaxed">
            We are bringing back the soul of the 90s internet. The <span className="font-bold text-blue-800">{APP_CONSTANTS.TICKER}</span> era. 
            Dancing babies, flame text, and endless loops.
          </p>
        </div>
      </div>

      <div className="bg-yellow-100 border border-black p-4 mb-4 font-['Courier_New']">
        <h3 className="font-bold border-b border-black mb-2">System Information:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ticker: <span className="bg-blue-800 text-white px-1">{APP_CONSTANTS.TICKER}</span></li>
          <li>Format: Animated Graphics Interchange</li>
          <li>LP: Locked in the Matrix</li>
          <li>Vibe: 60 FPS</li>
        </ul>
      </div>

      <p className="text-center italic mt-8 text-gray-500">
        "I thought it was a video, but it was just a .gif" - Bill G.
      </p>
    </div>
  );
};