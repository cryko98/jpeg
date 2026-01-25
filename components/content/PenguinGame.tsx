import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button98 } from '../ui/Button98';

interface GameObject {
  x: number;
  y: number;
  type: 'fish' | 'rock';
  id: number;
}

export const PenguinGameContent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI State (for rendering React overlays only)
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showGameOverScreen, setShowGameOverScreen] = useState(false);
  const [scoreDisplay, setScoreDisplay] = useState(0);

  // Game Logic State (Refs used for mutable game state to avoid stale closures in animation loop)
  const gameState = useRef({
    isPlaying: false,
    gameOver: false,
    score: 0,
    penguinX: 175, // Center of 350px canvas
    objects: [] as GameObject[],
    lastSpawnTime: 0
  });

  const frameId = useRef<number>(0);

  // Input Handling - Attached to window to catch key presses anywhere
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameState.current.isPlaying || gameState.current.gameOver) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      gameState.current.penguinX = Math.max(20, gameState.current.penguinX - 25);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      gameState.current.penguinX = Math.min(330, gameState.current.penguinX + 25);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const startGame = () => {
    // Reset Game State immediately
    gameState.current = {
      isPlaying: true,
      gameOver: false,
      score: 0,
      penguinX: 175,
      objects: [],
      lastSpawnTime: Date.now()
    };

    // Update UI
    setShowStartScreen(false);
    setShowGameOverScreen(false);
    setScoreDisplay(0);

    // Cancel any existing loop and start new one
    if (frameId.current) cancelAnimationFrame(frameId.current);
    gameLoop();
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;

    // If game stopped, do not animate
    if (!state.isPlaying || state.gameOver) return;

    // --- GAME LOGIC ---

    const now = Date.now();
    // Spawn rate: gets faster as score increases (capped at 400ms)
    const spawnRate = Math.max(400, 1000 - (state.score * 15)); 
    
    if (now - state.lastSpawnTime > spawnRate) {
      state.objects.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        type: Math.random() > 0.3 ? 'fish' : 'rock', // 70% chance fish
        id: now
      });
      state.lastSpawnTime = now;
    }

    // Move Objects: Speed increases with score
    const currentSpeed = 3 + (state.score * 0.1);
    
    // Collision Detection Loop
    for (let i = state.objects.length - 1; i >= 0; i--) {
        const obj = state.objects[i];
        obj.y += currentSpeed;

        // Hitbox check
        // Penguin is drawn at (state.penguinX, canvas.height - 20) roughly
        // We check if object is near the bottom and within horizontal range
        if (obj.y > canvas.height - 60 && obj.y < canvas.height - 5) {
            // Horizontal distance check (30px radius)
            if (Math.abs(obj.x - state.penguinX) < 35) {
                if (obj.type === 'rock') {
                    endGame();
                    return; // Stop the loop immediately
                } else {
                    // Collect Fish
                    state.score += 10;
                    setScoreDisplay(state.score); // Sync React UI
                    state.objects.splice(i, 1); // Remove fish
                    continue;
                }
            }
        }

        // Remove off-screen objects
        if (obj.y > canvas.height) {
            state.objects.splice(i, 1);
        }
    }

    // --- RENDER ---
    
    // 1. Clear Screen
    ctx.fillStyle = '#87CEEB'; // Sky Blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Ground
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // 3. Draw Penguin
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("🐧", state.penguinX, canvas.height - 10);

    // 4. Draw Objects
    ctx.textAlign = "left"; // Reset for objects
    ctx.textBaseline = "alphabetic";
    ctx.font = "30px Arial";
    state.objects.forEach(obj => {
        ctx.fillText(obj.type === 'fish' ? "🐟" : "🪨", obj.x, obj.y);
    });

    // 5. Request Next Frame
    frameId.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    gameState.current.isPlaying = false;
    gameState.current.gameOver = true;
    setShowGameOverScreen(true);
    if (frameId.current) cancelAnimationFrame(frameId.current);
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (frameId.current) cancelAnimationFrame(frameId.current);
      };
  }, []);
  
  // Mobile Controls Wrappers
  const moveLeft = () => {
      if (!gameState.current.isPlaying) return;
      gameState.current.penguinX = Math.max(20, gameState.current.penguinX - 25);
  };
  
  const moveRight = () => {
      if (!gameState.current.isPlaying) return;
      gameState.current.penguinX = Math.min(330, gameState.current.penguinX + 25);
  };

  return (
    <div className="flex flex-col items-center h-full bg-[#c0c0c0] p-2 select-none">
      <div className="bg-black text-[#00ff00] font-mono p-2 w-full text-center mb-2 border-2 border-gray-600 shadow-inner text-xl font-bold">
        SCORE: {scoreDisplay}
      </div>

      <div className="relative border-4 border-gray-600 bg-blue-300 shadow-xl">
        <canvas 
          ref={canvasRef} 
          width={350} 
          height={400} 
          className="block"
        />
        
        {/* Start Screen Overlay */}
        {showStartScreen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white z-10 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4 font-['Courier_New'] text-[#00ffff] drop-shadow-md">PENGUIN RUSH</h2>
            <Button98 onClick={startGame} className="animate-pulse scale-110">START GAME</Button98>
            <div className="mt-6 text-center font-mono">
                <p>Avoid Rocks 🪨</p>
                <p>Catch Fish 🐟</p>
            </div>
            <p className="mt-4 text-xs text-gray-300">Use Arrow Keys or Buttons</p>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {showGameOverScreen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 text-white z-10">
            <h2 className="text-4xl font-bold mb-2 text-red-500 bg-black px-2 border border-white">GAME OVER</h2>
            <p className="mb-6 text-2xl font-mono">Score: {scoreDisplay}</p>
            <Button98 onClick={startGame}>TRY AGAIN</Button98>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-8 md:hidden w-full justify-center">
         <Button98 
            className="w-16 h-16 text-3xl active:bg-gray-400 flex items-center justify-center" 
            onTouchStart={(e) => { e.preventDefault(); moveLeft(); }} 
            onMouseDown={moveLeft}
         >
            ⬅️
         </Button98>
         <Button98 
            className="w-16 h-16 text-3xl active:bg-gray-400 flex items-center justify-center" 
            onTouchStart={(e) => { e.preventDefault(); moveRight(); }} 
            onMouseDown={moveRight}
         >
            ➡️
         </Button98>
      </div>
    </div>
  );
};