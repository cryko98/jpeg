import React from 'react';

interface Button98Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Button98: React.FC<Button98Props> = ({ children, className = '', active, ...props }) => {
  return (
    <button
      className={`
        px-3 py-1 text-lg font-bold
        bg-[#c0c0c0] text-black
        border-t-2 border-l-2 border-b-2 border-r-2
        ${active 
          ? 'border-t-black border-l-black border-r-white border-b-white bg-[url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=")]' 
          : 'border-t-white border-l-white border-r-black border-b-black'
        }
        active:border-t-black active:border-l-black active:border-r-white active:border-b-white
        outline-none
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
