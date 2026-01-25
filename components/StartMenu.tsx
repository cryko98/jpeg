import React from 'react';
import { APP_CONSTANTS } from '../types';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (id: string) => void;
  items: Array<{ id: string; label: string; icon: React.ReactNode }>;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose, onItemClick, items }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-10 left-1 w-auto bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black shadow-2xl z-[10000] flex">
      <div className="w-8 bg-[#000080] text-white flex items-end justify-center pb-4">
        <span className="transform -rotate-90 text-[9px] font-mono tracking-tighter whitespace-nowrap mb-4 h-full flex items-center opacity-90">
          CA: {APP_CONSTANTS.CA}
        </span>
      </div>
      <div className="flex-1 py-1 min-w-[200px]">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-4 py-2 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-3 text-lg"
            onClick={() => {
              onItemClick(item.id);
              onClose();
            }}
          >
            <span className="text-xl w-6 flex justify-center items-center">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
        <div className="border-t border-[#808080] border-b border-white my-1 mx-1"></div>
        <div className="px-4 py-2 hover:bg-[#000080] hover:text-white cursor-pointer flex items-center gap-3 text-lg" onClick={() => {
            if(confirm('Are you sure you want to restart?')) {
                window.location.reload();
            }
        }}>
            <span className="text-xl w-6 flex justify-center items-center">⚠️</span>
            <span>Shut Down...</span>
        </div>
      </div>
    </div>
  );
};