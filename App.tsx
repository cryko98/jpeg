import React, { useState, useEffect } from 'react';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { Window98 } from './components/ui/Window98';
import { DesktopIcon } from './components/DesktopIcon';
import { WindowState, Position, APP_CONSTANTS } from './types';
import { AboutContent } from './components/content/About';
import { WalletContent } from './components/content/Wallet';
import { GalleryContent } from './components/content/Gallery';
import { DexScreenerEmbed } from './components/content/DexScreenerEmbed';
import { PaintContent } from './components/content/Paint';
import { HowToBuyContent } from './components/content/HowToBuy';

// App Logo
const PENGUIN_LOGO = "https://pbs.twimg.com/media/G_gCwofXsAAZ5lk?format=jpg&name=medium";

// Initial Windows Config
const INITIAL_WINDOWS: WindowState[] = [
  {
    id: 'welcome',
    title: 'Welcome.exe',
    isOpen: true,
    isMinimized: false,
    zIndex: 1,
    position: { x: 50, y: 50 },
    width: 600,
    height: 500,
    icon: <img src={PENGUIN_LOGO} alt="icon" className="w-4 h-4 object-cover" />,
    content: <AboutContent />
  },
  {
    id: 'wallet',
    title: 'Wallet.dat',
    isOpen: false,
    isMinimized: false,
    zIndex: 2,
    position: { x: 150, y: 150 },
    width: 450,
    height: 400,
    icon: '💰',
    content: <WalletContent />
  },
  {
    id: 'howtobuy',
    title: 'How_to_buy.txt',
    isOpen: false,
    isMinimized: false,
    zIndex: 3,
    position: { x: 100, y: 100 },
    width: 500,
    height: 500,
    icon: '📝',
    content: <HowToBuyContent />
  },
  {
    id: 'gallery',
    title: 'My Pictures',
    isOpen: false,
    isMinimized: false,
    zIndex: 4,
    position: { x: 200, y: 50 },
    width: 500,
    height: 500,
    icon: '🖼️',
    content: <GalleryContent />
  },
  {
    id: 'dexscreener',
    title: 'DexScreener',
    isOpen: false,
    isMinimized: false,
    zIndex: 5,
    position: { x: 100, y: 100 },
    width: 600,
    height: 500,
    icon: '🦅',
    content: <DexScreenerEmbed />
  },
  {
    id: 'paint',
    title: 'Paint.exe',
    isOpen: false,
    isMinimized: false,
    zIndex: 6,
    position: { x: 120, y: 60 },
    width: 700,
    height: 550,
    icon: '🎨',
    content: <PaintContent />
  }
];

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('welcome');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [maxZ, setMaxZ] = useState(10);

  // Initial calculation for center screen
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    setWindows(prev => prev.map(win => ({
        ...win,
        position: {
            x: Math.max(0, Math.min(w - (win.width || 400), Math.random() * (w - 400))),
            y: Math.max(0, Math.min(h - (win.height || 400) - 50, Math.random() * (h - 500)))
        }
    })));
  }, []);

  const handleWindowAction = (action: string, id: string, payload?: any) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;

      switch (action) {
        case 'OPEN':
          const newZ = maxZ + 1;
          setMaxZ(newZ);
          setActiveWindowId(id);
          return { ...w, isOpen: true, isMinimized: false, zIndex: newZ };
        case 'CLOSE':
          return { ...w, isOpen: false };
        case 'MINIMIZE':
          setActiveWindowId(null);
          return { ...w, isMinimized: true };
        case 'FOCUS':
          if (activeWindowId === id) return w;
          const focusZ = maxZ + 1;
          setMaxZ(focusZ);
          setActiveWindowId(id);
          return { ...w, zIndex: focusZ, isMinimized: false };
        case 'MOVE':
          return { ...w, position: payload };
        default:
          return w;
      }
    }));
  };

  const toggleStart = () => setIsStartOpen(!isStartOpen);

  return (
    <div className="relative w-screen h-screen overflow-hidden selection:bg-[#000080] selection:text-white"
         onClick={() => setIsStartOpen(false)}>
      
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col gap-6 z-0 flex-wrap h-[calc(100vh-60px)] content-start">
        <DesktopIcon 
          label="My Computer" 
          icon={<img src={PENGUIN_LOGO} alt="icon" className="w-full h-full object-cover" />}
          onDoubleClick={() => handleWindowAction('OPEN', 'welcome')} 
        />
        
        <DesktopIcon 
          label="DexScreener" 
          icon={<div className="text-[14px] bg-black text-white w-full h-full flex items-center justify-center font-bold rounded-sm border border-gray-500">DEX</div>}
          onDoubleClick={() => handleWindowAction('OPEN', 'dexscreener')} 
        />

        <DesktopIcon 
          label="How to Buy" 
          icon="💊" 
          onDoubleClick={() => handleWindowAction('OPEN', 'howtobuy')} 
        />

        <DesktopIcon 
          label="MS Paint" 
          icon="🎨" 
          onDoubleClick={() => handleWindowAction('OPEN', 'paint')} 
        />

        <DesktopIcon 
          label="Wallet" 
          icon="💰" 
          onDoubleClick={() => handleWindowAction('OPEN', 'wallet')} 
        />
        
        <DesktopIcon 
          label="Memes" 
          icon="🖼️" 
          onDoubleClick={() => handleWindowAction('OPEN', 'gallery')} 
        />
        
        <a href="https://x.com/i/communities/2015347338366366056" target="_blank" rel="noreferrer">
             <DesktopIcon 
            label="Community" 
            icon={<div className="text-5xl font-bold font-mono">𝕏</div>}
            onDoubleClick={() => {}} 
            />
        </a>
      </div>

      {/* Windows */}
      {windows.map(w => (
        <Window98
          key={w.id}
          window={w}
          onClose={(id) => handleWindowAction('CLOSE', id)}
          onMinimize={(id) => handleWindowAction('MINIMIZE', id)}
          onFocus={(id) => handleWindowAction('FOCUS', id)}
          onMove={(id, pos) => handleWindowAction('MOVE', id, pos)}
        />
      ))}

      {/* Start Menu */}
      <div onClick={(e) => e.stopPropagation()}>
        <StartMenu 
            isOpen={isStartOpen} 
            onClose={() => setIsStartOpen(false)}
            onItemClick={(id) => handleWindowAction('OPEN', id)}
            items={windows.map(w => ({ 
              id: w.id, 
              label: w.title, 
              icon: typeof w.icon === 'string' ? w.icon : '📄' 
            }))}
        />
      </div>

      {/* Taskbar */}
      <Taskbar 
        windows={windows}
        activeWindowId={activeWindowId}
        onWindowClick={(id) => {
            const win = windows.find(w => w.id === id);
            if (win?.isMinimized || activeWindowId !== id) {
                handleWindowAction('FOCUS', id);
            } else {
                handleWindowAction('MINIMIZE', id);
            }
        }}
        onStartClick={(e: any) => {
            e.stopPropagation();
            toggleStart();
        }}
        isStartOpen={isStartOpen}
      />
    </div>
  );
};

export default App;