import React, { useState, useEffect } from 'react';
import { Button98 } from './ui/Button98';
import { WindowState } from '../types';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  onWindowClick: (id: string) => void;
  onStartClick: () => void;
  isStartOpen: boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({ windows, activeWindowId, onWindowClick, onStartClick, isStartOpen }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 z-50 select-none">
      <Button98 
        className={`flex items-center gap-2 mr-2 font-bold italic ${isStartOpen ? 'border-t-black border-l-black border-r-white border-b-white bg-gray-300' : ''}`}
        onClick={onStartClick}
      >
        <span className="text-xl">🪟</span> Start
      </Button98>

      <div className="flex-1 flex gap-1 overflow-x-auto px-2">
        {windows.filter(w => w.isOpen).map(w => (
          <Button98
            key={w.id}
            active={activeWindowId === w.id && !w.isMinimized}
            onClick={() => onWindowClick(w.id)}
            className={`min-w-[140px] max-w-[200px] text-left truncate flex items-center gap-2 text-sm ${
              activeWindowId === w.id && !w.isMinimized ? 'font-bold bg-gray-200' : 'font-normal'
            }`}
          >
             <span>{w.icon || '📄'}</span> {w.title}
          </Button98>
        ))}
      </div>

      <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-r-2 border-b-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-3 py-1 text-sm">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};
