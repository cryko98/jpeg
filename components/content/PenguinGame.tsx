import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button98 } from '../ui/Button98';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface GameObject {
  x: number;
  y: number;
  type: 'fish' | 'rock';
  id: number;
  drift: number; // Horizontal movement
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  created_at: string;
}

export const PenguinGameContent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI State
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showGameOverScreen, setShowGameOverScreen] = useState(false);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Leaderboard State
  const [username, setUsername] = useState('');
  // Use a ref for username to ensure access inside closures (game loop)
  const usernameRef = useRef('');
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync username state to ref
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Game Logic State
  const gameState = useRef({
    isPlaying: false,
    gameOver: false,
    score: 0,
    penguinX: 175,
    penguinVel: 0,
    objects: [] as GameObject[],
    particles: [] as Particle[],
    lastSpawnTime: 0,
    difficultyMultiplier: 1
  });

  // Input State (Set of currently pressed keys)
  const keysPressed = useRef<Set<string>>(new Set());
  const frameId = useRef<number>(0);

  // Load High Score from local storage (backup)
  useEffect(() => {
    const saved = localStorage.getItem('penguin_highscore');
    if (saved) setHighScore(parseInt(saved));
    const savedUser = localStorage.getItem('penguin_username');
    if (savedUser) setUsername(savedUser);
    
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    if (isLoadingLeaderboard) return; // Prevent double click
    setIsLoadingLeaderboard(true);
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('username, score, created_at')
            .order('score', { ascending: false })
            .limit(10);
            
        if (error) {
            console.error("Error fetching leaderboard:", error);
        } else if (data) {
            setLeaderboard(data);
        }
    } catch (err) {
        console.error("Exception fetching leaderboard:", err);
    } finally {
        setIsLoadingLeaderboard(false);
    }
  };

  const submitScore = async (finalScore: number) => {
    const currentUsername = usernameRef.current;
    if (!currentUsername || finalScore === 0) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    // If mock mode, pretend to save
    if (!isSupabaseConfigured) {
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitError("Offline Mode: Score not saved online.");
        }, 1000);
        return;
    }

    try {
        const { error } = await supabase.from('leaderboard').insert([
            { username: currentUsername, score: finalScore }
        ]);

        if (error) {
            console.error("Supabase insert error:", error);
            setSubmitError(error.message || "Failed to save score.");
        } else {
            // Refresh leaderboard after submission
            await fetchLeaderboard();
        }
    } catch (err: any) {
        console.error("Error submitting score:", err);
        setSubmitError(err.message || "Unexpected error.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Input Handlers ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current.add(e.key);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Mobile Input Helpers
  const setInput = (key: string, pressed: boolean) => {
    if (pressed) keysPressed.current.add(key);
    else keysPressed.current.delete(key);
  };

  const startGame = () => {
    if (!username.trim()) {
        alert("Please enter your Twitter username (@username) to play!");
        return;
    }
    
    // Save username for next time
    localStorage.setItem('penguin_username', username);

    gameState.current = {
      isPlaying: true,
      gameOver: false,
      score: 0,
      penguinX: 175,
      penguinVel: 0,
      objects: [],
      particles: [],
      lastSpawnTime: Date.now(),
      difficultyMultiplier: 1
    };

    setShowStartScreen(false);
    setShowGameOverScreen(false);
    setScoreDisplay(0);
    setSubmitError(null);

    if (frameId.current) cancelAnimationFrame(frameId.current);
    gameLoop();
  };

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      gameState.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 20 + Math.random() * 10,
        color
      });
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;

    if (!state.isPlaying || state.gameOver) return;

    // --- 1. UPDATE PHYSICS ---

    // Movement Logic (Smooth sliding)
    const moveSpeed = 6;
    let dx = 0;
    
    if (keysPressed.current.has('ArrowLeft')) dx -= moveSpeed;
    if (keysPressed.current.has('ArrowRight')) dx += moveSpeed;

    state.penguinX += dx;
    
    // Clamp to screen
    if (state.penguinX < 20) state.penguinX = 20;
    if (state.penguinX > canvas.width - 20) state.penguinX = canvas.width - 20;

    // Difficulty ramp up
    state.difficultyMultiplier = 1 + (state.score * 0.002);

    // Spawning
    const now = Date.now();
    const spawnRate = Math.max(300, 1000 / state.difficultyMultiplier);
    
    if (now - state.lastSpawnTime > spawnRate) {
      state.objects.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,
        type: Math.random() > 0.35 ? 'fish' : 'rock',
        id: now,
        drift: (Math.random() - 0.5) * (state.difficultyMultiplier * 0.5) // Random drift
      });
      state.lastSpawnTime = now;
    }

    // Update Objects
    const fallSpeed = 3 * state.difficultyMultiplier;

    for (let i = state.objects.length - 1; i >= 0; i--) {
        const obj = state.objects[i];
        obj.y += fallSpeed;
        obj.x += obj.drift;

        // Bounce off walls (drift)
        if (obj.x < 10 || obj.x > canvas.width - 10) obj.drift *= -1;

        // Collision Check
        // Penguin Hitbox: approx 40x40 center bottom
        const hitDist = 30; // forgiving hitbox
        const distY = Math.abs(obj.y - (canvas.height - 20));
        const distX = Math.abs(obj.x - state.penguinX);

        if (distY < 30 && distX < hitDist) {
             if (obj.type === 'rock') {
                 createParticles(state.penguinX, canvas.height - 20, '#FF0000');
                 endGame();
                 return;
             } else {
                 // Caught Fish
                 state.score += 10;
                 setScoreDisplay(state.score);
                 createParticles(obj.x, obj.y, '#FFD700'); // Gold particles
                 state.objects.splice(i, 1);
                 continue;
             }
        }

        if (obj.y > canvas.height) state.objects.splice(i, 1);
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) state.particles.splice(i, 1);
    }

    // --- 2. RENDER ---
    
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mountains (Background decor)
    ctx.fillStyle = '#E0F7FA';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(100, canvas.height - 100);
    ctx.lineTo(200, canvas.height);
    ctx.moveTo(150, canvas.height);
    ctx.lineTo(250, canvas.height - 150);
    ctx.lineTo(350, canvas.height);
    ctx.fill();

    // Ground
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Penguin
    ctx.save();
    ctx.translate(state.penguinX, canvas.height - 15);
    // Tilt effect based on movement
    const tilt = dx * 0.05; 
    ctx.rotate(tilt);
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("🐧", 0, 0);
    ctx.restore();

    // Objects
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "30px Arial";
    state.objects.forEach(obj => {
        ctx.fillText(obj.type === 'fish' ? "🐟" : "🪨", obj.x, obj.y);
    });

    // Particles
    state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
    });

    // Score HUD
    ctx.fillStyle = "black";
    ctx.font = "bold 20px Courier New";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${state.score}`, 10, 30);
    ctx.textAlign = "right";
    ctx.fillStyle = "#555";
    ctx.fillText(`HI: ${Math.max(state.score, highScore)}`, canvas.width - 10, 30);

    frameId.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    gameState.current.isPlaying = false;
    gameState.current.gameOver = true;
    setShowGameOverScreen(true);
    
    const finalScore = gameState.current.score;

    if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('penguin_highscore', finalScore.toString());
    }

    // Draw one last frame to show collision
    const canvas = canvasRef.current;
    if(canvas) {
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Submit score to Supabase
    submitScore(finalScore);
  };

  useEffect(() => {
      return () => {
          if (frameId.current) cancelAnimationFrame(frameId.current);
      };
  }, []);

  return (
    <div className="flex flex-col items-center h-full bg-[#c0c0c0] p-2 select-none overflow-hidden">
      <div className="relative border-4 border-gray-600 bg-blue-300 shadow-xl w-[350px] max-w-full h-[400px]">
        <canvas 
          ref={canvasRef} 
          width={350} 
          height={400} 
          className="block w-full h-full"
        />
        
        {/* Start Screen */}
        {showStartScreen && (
          <div className="absolute inset-0 flex flex-col items-center bg-black/80 text-white z-10 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar">
            <h2 className="text-4xl font-bold mb-2 font-['VT323'] text-[#00ffff] drop-shadow-md tracking-widest shrink-0">PENGUIN RUSH</h2>
            
            <div className="w-full max-w-[280px] mb-4 shrink-0">
                <label className="block text-xs mb-1 text-gray-300">Twitter Username (@...):</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@elonmusk"
                    className="w-full bg-white text-black font-mono px-2 py-1 border-2 border-inset border-gray-600 focus:outline-none"
                    maxLength={20}
                />
            </div>

            <Button98 onClick={startGame} className="animate-pulse scale-105 px-6 py-2 mb-4 shrink-0">START GAME</Button98>

            {/* Leaderboard Table */}
            <div className="w-full bg-[#000080] border-2 border-white p-2">
                <h3 className="text-center text-yellow-300 font-bold mb-2 border-b border-white pb-1 flex justify-between items-center">
                    <span>🏆 TOP 10</span>
                    <div className="flex items-center gap-2">
                        {!isSupabaseConfigured && <span className="text-xs text-red-300 bg-red-900 px-1 blink">OFFLINE</span>}
                        <Button98 
                            onClick={fetchLeaderboard} 
                            disabled={isLoadingLeaderboard}
                            className="px-1 py-0 h-6 text-xs w-6 flex items-center justify-center"
                            title="Refresh Leaderboard"
                        >
                            {isLoadingLeaderboard ? '...' : '🔄'}
                        </Button98>
                    </div>
                </h3>
                {isLoadingLeaderboard ? (
                    <div className="text-center text-sm">Loading...</div>
                ) : (
                    <table className="w-full text-sm font-mono">
                        <tbody>
                            {leaderboard.map((entry, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white/10' : ''}>
                                    <td className="px-1 w-6">{idx + 1}.</td>
                                    <td className="px-1 text-left truncate max-w-[120px]">{entry.username}</td>
                                    <td className="px-1 text-right text-yellow-200">{entry.score}</td>
                                </tr>
                            ))}
                            {leaderboard.length === 0 && (
                                <tr><td colSpan={3} className="text-center py-2 text-gray-400">
                                    {isSupabaseConfigured ? "No scores yet." : "Connect Supabase to see scores."}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {showGameOverScreen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 text-white z-10">
            <h2 className="text-5xl font-bold mb-4 text-red-500 bg-black px-4 py-1 border-2 border-white font-['VT323']">GAME OVER</h2>
            <div className="text-center mb-6 font-mono">
                <p className="text-xl">Score: {scoreDisplay}</p>
                {isSubmitting && <p className="text-sm animate-pulse text-yellow-300">Saving score...</p>}
                {!isSubmitting && !submitError && <p className="text-xs text-gray-300 mt-2">Score saved for {username}!</p>}
                {submitError && (
                    <div className="mt-2 bg-black border border-red-500 p-2">
                        <p className="text-xs text-red-300 font-bold">ERROR SAVING SCORE:</p>
                        <p className="text-xs text-red-200">{submitError}</p>
                    </div>
                )}
            </div>
            <Button98 onClick={() => {
                setShowGameOverScreen(false);
                setShowStartScreen(true); // Go back to start to see leaderboard
                fetchLeaderboard();
            }}>MAIN MENU</Button98>
          </div>
        )}
      </div>

      {/* Improved Mobile Controls */}
      <div className="mt-4 flex gap-4 w-full max-w-[350px] justify-between md:hidden pb-4">
         <Button98 
            className="flex-1 h-16 text-4xl active:bg-gray-400 flex items-center justify-center touch-none select-none" 
            onPointerDown={(e) => { e.preventDefault(); setInput('ArrowLeft', true); }}
            onPointerUp={(e) => { e.preventDefault(); setInput('ArrowLeft', false); }}
            onPointerLeave={(e) => { e.preventDefault(); setInput('ArrowLeft', false); }}
            onContextMenu={(e) => e.preventDefault()}
         >
            ⬅️
         </Button98>
         <Button98 
            className="flex-1 h-16 text-4xl active:bg-gray-400 flex items-center justify-center touch-none select-none" 
            onPointerDown={(e) => { e.preventDefault(); setInput('ArrowRight', true); }}
            onPointerUp={(e) => { e.preventDefault(); setInput('ArrowRight', false); }}
            onPointerLeave={(e) => { e.preventDefault(); setInput('ArrowRight', false); }}
            onContextMenu={(e) => e.preventDefault()}
         >
            ➡️
         </Button98>
      </div>
      <div className="hidden md:block mt-2 text-gray-600 font-mono text-sm">
          Use Arrow Keys to Move
      </div>
    </div>
  );
};