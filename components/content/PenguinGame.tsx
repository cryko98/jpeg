import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button98 } from '../ui/Button98';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const GIRAFFE_IMG_SRC = "https://png.pngtree.com/png-vector/20240809/ourmid/pngtree-cute-mini-giraffe-png-image_13420476.png";

interface GameObject {
  x: number;
  y: number;
  type: 'leaf' | 'rock';
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

export const GiraffeGameContent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI State
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showGameOverScreen, setShowGameOverScreen] = useState(false);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Leaderboard State
  const [username, setUsername] = useState('');
  const usernameRef = useRef('');
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const giraffeImageRef = useRef<HTMLImageElement | null>(null);

  // Load Image
  useEffect(() => {
    const img = new Image();
    img.src = GIRAFFE_IMG_SRC;
    giraffeImageRef.current = img;
  }, []);

  // Sync username state to ref
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Game Logic State
  const gameState = useRef({
    isPlaying: false,
    gameOver: false,
    score: 0,
    giraffeX: 175,
    objects: [] as GameObject[],
    particles: [] as Particle[],
    lastSpawnTime: 0,
    difficultyMultiplier: 1
  });

  const keysPressed = useRef<Set<string>>(new Set());
  const frameId = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('giraffe_highscore');
    if (saved) setHighScore(parseInt(saved));
    const savedUser = localStorage.getItem('giraffe_username');
    if (savedUser) setUsername(savedUser);
    
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    if (isLoadingLeaderboard) return;
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
            setSubmitError(error.message || "Failed to save score.");
        } else {
            await fetchLeaderboard();
        }
    } catch (err: any) {
        setSubmitError(err.message || "Unexpected error.");
    } finally {
        setIsSubmitting(false);
    }
  };

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

  const setInput = (key: string, pressed: boolean) => {
    if (pressed) keysPressed.current.add(key);
    else keysPressed.current.delete(key);
  };

  const startGame = () => {
    if (!username.trim()) {
        alert("Please enter your name to play!");
        return;
    }
    
    localStorage.setItem('giraffe_username', username);

    gameState.current = {
      isPlaying: true,
      gameOver: false,
      score: 0,
      giraffeX: 175,
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

    // Movement
    const moveSpeed = 7;
    let dx = 0;
    if (keysPressed.current.has('ArrowLeft')) dx -= moveSpeed;
    if (keysPressed.current.has('ArrowRight')) dx += moveSpeed;

    state.giraffeX += dx;
    if (state.giraffeX < 20) state.giraffeX = 20;
    if (state.giraffeX > canvas.width - 20) state.giraffeX = canvas.width - 20;

    state.difficultyMultiplier = 1 + (state.score * 0.002);

    // Spawning
    const now = Date.now();
    const spawnRate = Math.max(300, 1000 / state.difficultyMultiplier);
    
    if (now - state.lastSpawnTime > spawnRate) {
      state.objects.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,
        type: Math.random() > 0.4 ? 'leaf' : 'rock',
        id: now,
        drift: (Math.random() - 0.5) * (state.difficultyMultiplier * 0.8)
      });
      state.lastSpawnTime = now;
    }

    // Update Objects
    const fallSpeed = 3.5 * state.difficultyMultiplier;

    for (let i = state.objects.length - 1; i >= 0; i--) {
        const obj = state.objects[i];
        obj.y += fallSpeed;
        obj.x += obj.drift;

        if (obj.x < 10 || obj.x > canvas.width - 10) obj.drift *= -1;

        const hitDist = 35; 
        const distY = Math.abs(obj.y - (canvas.height - 30));
        const distX = Math.abs(obj.x - state.giraffeX);

        if (distY < 40 && distX < hitDist) {
             if (obj.type === 'rock') {
                 createParticles(state.giraffeX, canvas.height - 20, '#FF0000');
                 endGame();
                 return;
             } else {
                 state.score += 10;
                 setScoreDisplay(state.score);
                 createParticles(obj.x, obj.y, '#4CAF50'); // Green particles
                 state.objects.splice(i, 1);
                 continue;
             }
        }

        if (obj.y > canvas.height) state.objects.splice(i, 1);
    }

    // Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) state.particles.splice(i, 1);
    }

    // Render
    // Sahara Background (Sandy Yellow/Orange)
    ctx.fillStyle = '#F4A460'; // Sandy Brown
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 50, 30, 0, Math.PI * 2);
    ctx.fill();

    // Dunes/Hills
    ctx.fillStyle = '#DEB887'; // Burlywood (slightly darker sand)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.quadraticCurveTo(100, canvas.height - 100, 200, canvas.height - 60);
    ctx.quadraticCurveTo(280, canvas.height - 20, canvas.width, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // Ground line
    ctx.fillStyle = '#8B4513'; // SaddleBrown
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

    // Giraffe Character
    ctx.save();
    ctx.translate(state.giraffeX, canvas.height - 10);
    const tilt = dx * 0.04; 
    ctx.rotate(tilt);
    
    // Draw the image if loaded, otherwise fallback to text for safety
    if (giraffeImageRef.current && giraffeImageRef.current.complete) {
        // Center the image at (0,0) after translation
        const w = 60;
        const h = 70;
        ctx.drawImage(giraffeImageRef.current, -w/2, -h, w, h);
    } else {
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("🦒", 0, 0);
    }
    
    ctx.restore();

    // Objects
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "35px Arial";
    state.objects.forEach(obj => {
        // Rock or Acacia Leaf
        ctx.fillText(obj.type === 'leaf' ? "🌿" : "🪨", obj.x, obj.y);
    });

    // Particles
    state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
    });

    // HUD
    ctx.fillStyle = "#5D4037"; // Dark brown text
    ctx.font = "bold 20px VT323";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${state.score}`, 10, 30);
    ctx.textAlign = "right";
    ctx.fillText(`BEST: ${Math.max(state.score, highScore)}`, canvas.width - 10, 30);

    frameId.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    gameState.current.isPlaying = false;
    gameState.current.gameOver = true;
    setShowGameOverScreen(true);
    
    const finalScore = gameState.current.score;
    if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('giraffe_highscore', finalScore.toString());
    }
    submitScore(finalScore);
  };

  useEffect(() => {
      return () => {
          if (frameId.current) cancelAnimationFrame(frameId.current);
      };
  }, []);

  return (
    <div className="flex flex-col items-center h-full bg-[#c0c0c0] p-2 select-none overflow-hidden">
      <div className="relative border-4 border-gray-600 bg-orange-100 shadow-xl w-[350px] max-w-full h-[400px]">
        <canvas ref={canvasRef} width={350} height={400} className="block w-full h-full" />
        
        {showStartScreen && (
          <div className="absolute inset-0 flex flex-col items-center bg-black/85 text-white z-10 p-4">
            <h2 className="text-4xl font-bold mb-4 font-['VT323'] text-yellow-500 drop-shadow-lg tracking-widest">GIRAFFE RUSH</h2>
            <div className="w-full max-w-[280px] mb-6">
                <label className="block text-xs mb-1 text-yellow-100">Explorer Name:</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Giraffe Fan"
                    className="w-full bg-white text-black font-mono px-2 py-1 border-2 border-inset border-gray-600"
                    maxLength={15}
                />
            </div>
            <Button98 onClick={startGame} className="scale-110 px-8 py-2 mb-6">START SAFARI</Button98>
            <div className="w-full bg-[#8B4513] border-2 border-white p-2 text-xs">
                <h3 className="text-center font-bold mb-1 text-yellow-300">🏜️ SAHARA KINGS</h3>
                <table className="w-full font-mono">
                    <tbody>
                        {leaderboard.map((entry, idx) => (
                            <tr key={idx} className={idx === 0 ? 'text-yellow-300' : 'text-white'}>
                                <td className="w-6">{idx + 1}.</td>
                                <td className="text-left truncate">{entry.username}</td>
                                <td className="text-right">{entry.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {showGameOverScreen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-900/95 text-white z-20">
            <h2 className="text-5xl font-bold mb-4 text-yellow-500 font-['VT323']">GAME OVER!</h2>
            <div className="text-center mb-6 font-mono">
                <p className="text-2xl">Leaves Eaten: {scoreDisplay}</p>
                {isSubmitting ? <p className="text-sm animate-pulse text-yellow-300">Syncing with blockchain...</p> : null}
            </div>
            <Button98 onClick={() => { setShowGameOverScreen(false); setShowStartScreen(true); fetchLeaderboard(); }}>REPLAY</Button98>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-4 w-full max-w-[350px] md:hidden">
         <Button98 
            className="flex-1 h-20 text-4xl active:bg-gray-400 flex items-center justify-center touch-none" 
            onPointerDown={(e) => { e.preventDefault(); setInput('ArrowLeft', true); }}
            onPointerUp={(e) => { e.preventDefault(); setInput('ArrowLeft', false); }}
            onPointerLeave={() => setInput('ArrowLeft', false)}
         >⬅️</Button98>
         <Button98 
            className="flex-1 h-20 text-4xl active:bg-gray-400 flex items-center justify-center touch-none" 
            onPointerDown={(e) => { e.preventDefault(); setInput('ArrowRight', true); }}
            onPointerUp={(e) => { e.preventDefault(); setInput('ArrowRight', false); }}
            onPointerLeave={() => setInput('ArrowRight', false)}
         >➡️</Button98>
      </div>
    </div>
  );
};