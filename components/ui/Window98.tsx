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
    onFocus(window.id);
    
    // Only drag if clicking the title bar
    if ((e.target as HTMLElement).closest('.title-bar')) {
      e.stopPropagation(); // Prevent bubbling only if dragging
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    onFocus(window.id);
    
    if ((e.target as HTMLElement).closest('.title-bar')) {
      // Don't stop propagation on touch to allow scrolling if needed elsewhere, 
      // but prevent default to stop page scroll when dragging window
      setIsDragging(true);
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - window.position.x,
        y: touch.clientY - window.position.y
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

    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging) {
            e.preventDefault(); // Prevent body scroll
            const touch = e.touches[0];
            onMove(window.id, {
                x: touch.clientX - dragOffset.x,
                y: touch.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragOffset, window.id, onMove]);

  if (!window.isOpen || window.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        transform: `translate(${window.position.x}px, ${window.position.y}px)`,
        zIndex: window.zIndex,
        width: window.width || 400,
        height: window.height ? window.height : 'auto'
      }}
      className="absolute bg-[#c0c0c0] p-1 border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-black border-b-black shadow-xl max-w-[95vw] max-h-[85vh] flex flex-col"
    >
      {/* Title Bar */}
      <div className="title-bar flex items-center justify-between bg-[#000080] px-2 py-1 mb-1 cursor-grab active:cursor-grabbing select-none shrink-0 touch-none">
        <div className="flex items-center gap-2 overflow-hidden">
           {window.icon && <span className="text-white text-sm shrink-0">{window.icon}</span>}
           <span className="text-white font-bold tracking-wider truncate text-sm">{window.title}</span>
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <Button98 onClick={(e) => { e.stopPropagation(); onMinimize(window.id); }} className="w-6 h-6 flex items-center justify-center text-sm leading-none p-0 touch-manipulation">_</Button98>
          <Button98 onClick={(e) => { e.stopPropagation(); onClose(window.id); }} className="w-6 h-6 flex items-center justify-center text-sm leading-none p-0 touch-manipulation">X</Button98>
        </div>
      </div>

      {/* Content */}
      <div className="relative overflow-auto flex-1 min-h-[200px]" style={{ height: window.height ? '100%' : 'auto' }}>
          {window.content}
      </div>
    </div>
  );
};