import React, { useRef, useState, useEffect } from 'react';
import { Button98 } from '../ui/Button98';

const COLORS = ['#000000', '#FFFFFF', '#808080', '#C0C0C0', '#800000', '#FF0000', '#808000', '#FFFF00', '#008000', '#00FF00', '#008080', '#00FFFF', '#000080', '#0000FF', '#800080', '#FF00FF'];

export const PaintContent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [lineWidth, setLineWidth] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = tool === 'eraser' ? 10 : lineWidth;
    ctx.lineCap = 'square';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'my-penguin-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 border-b-2 border-white mb-2">
        <div className="flex flex-col gap-1">
             <Button98 active={tool === 'pencil'} onClick={() => setTool('pencil')} className="w-8 h-8 p-0 flex items-center justify-center">✏️</Button98>
             <Button98 active={tool === 'eraser'} onClick={() => setTool('eraser')} className="w-8 h-8 p-0 flex items-center justify-center">🧼</Button98>
        </div>
        
        <div className="border-l-2 border-[#808080] border-r-2 border-white mx-1"></div>

        <div className="grid grid-cols-8 gap-1 bg-white p-1 border-2 border-inset border-[#808080]">
            {COLORS.map(c => (
                <div 
                    key={c}
                    className={`w-4 h-4 cursor-pointer border ${color === c ? 'border-black' : 'border-gray-400'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                        setColor(c);
                        setTool('pencil');
                    }}
                />
            ))}
        </div>

        <div className="flex-1"></div>
        
        <div className="flex gap-2">
             <Button98 onClick={clearCanvas}>New</Button98>
             <Button98 onClick={downloadImage}>Save</Button98>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-[#808080] p-4 flex justify-center items-start">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-white cursor-crosshair shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  );
};