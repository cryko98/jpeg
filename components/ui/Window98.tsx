import React, { useState, useEffect, useRef } from 'react';
import { WindowState, Position } from '../../types';
import { Button98 } from './Button98';

interface Window98Props {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, pos: Position) => void;
}

export const Window98: React.FC<Window98Props> = ({ window, onClose, onMinimize, onFocus, onMove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent click through
    onFocus(window.id);
    
    // Only drag if clicking the title bar
    if ((e.target as HTMLElement).closest('.title-bar')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onMove(window.id, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, window.id, onMove]);

  if (!window.isOpen || window.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate(${window.position.x}px, ${window.position.y}px)`,
        zIndex: window.zIndex,
        width: window.width || 400,
        height: window.height ? window.height : 'auto'
      }}
      className="absolute bg-[#c0c0c0] p-1 border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-black border-b-black shadow-xl"
    >
      {/* Title Bar */}
      <div className="title-bar flex items-center justify-between bg-[#000080] px-1 py-0.5 mb-1 cursor-default select-none">
        <div className="flex items-center gap-2">
           {window.icon && <span className="text-white text-sm">{window.icon}</span>}
           <span className="text-white font-bold tracking-wider">{window.title}</span>
        </div>
        <div className="flex gap-1">
          <Button98 onClick={(e) => { e.stopPropagation(); onMinimize(window.id); }} className="w-5 h-5 flex items-center justify-center text-xs leading-none p-0">_</Button98>
          <Button98 onClick={(e) => { e.stopPropagation(); onClose(window.id); }} className="w-5 h-5 flex items-center justify-center text-xs leading-none p-0">X</Button98>
        </div>
      </div>

      {/* Content */}
      <div className="relative overflow-auto max-h-[80vh] min-h-[200px]" style={{ height: window.height ? window.height - 40 : 'auto' }}>
          {window.content}
      </div>
    </div>
  );
};
