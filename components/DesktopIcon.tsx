import React from 'react';

interface DesktopIconProps {
  label: string;
  icon: React.ReactNode;
  onDoubleClick: () => void;
  selected?: boolean;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ label, icon, onDoubleClick }) => {
  return (
    <div 
      className="flex flex-col items-center w-24 gap-1 p-2 cursor-pointer group hover:bg-white/10 border border-transparent hover:border-white/20 active:border-white/30"
      onDoubleClick={onDoubleClick}
      onTouchEnd={onDoubleClick} // Better mobile support
    >
      <div className="w-10 h-10 flex items-center justify-center text-3xl drop-shadow-md">
        {icon}
      </div>
      <span className="text-white text-center text-sm bg-[#008080] px-1 line-clamp-2 select-none group-hover:bg-[#000080]">
        {label}
      </span>
    </div>
  );
};
