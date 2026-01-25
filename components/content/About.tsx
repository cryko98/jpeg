import React from 'react';
import { APP_CONSTANTS } from '../../types';

export const AboutContent: React.FC = () => {
  return (
    <div className="bg-white p-6 h-full text-black font-sans border-2 border-[#808080] border-inset">
      <h2 className="text-3xl font-bold mb-4 font-['Courier_New'] text-center">WELCOME TO {APP_CONSTANTS.TICKER}</h2>
      
      <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
        <img 
          src="https://pbs.twimg.com/media/G_gCwofXsAAZ5lk?format=jpg&name=medium" 
          alt="Penguin" 
          className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-[200px] h-[200px] object-cover"
        />
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            It is literally just a penguin. No fancy tech, no AI revolution, just a pixelated penguin living on the blockchain.
          </p>
          <p className="text-lg leading-relaxed">
            We are bringing back the soul of the internet. The <span className="font-bold text-blue-800">$.jpeg</span> era. 
            Simpler times. Blue screens. Dial-up noises. And penguins.
          </p>
        </div>
      </div>

      <div className="bg-yellow-100 border border-black p-4 mb-4 font-['Courier_New']">
        <h3 className="font-bold border-b border-black mb-2">Project Specs:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ticker: <span className="bg-blue-800 text-white px-1">{APP_CONSTANTS.TICKER}</span></li>
          <li>Tax: 0/0</li>
          <li>LP: Burnt</li>
          <li>Vibe: 100%</li>
        </ul>
      </div>

      <p className="text-center italic mt-8 text-gray-500">
        "I like the stock. I like the penguin." - Anonymous Win98 User
      </p>
    </div>
  );
};