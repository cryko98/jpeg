import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Button98 } from '../ui/Button98';

const RANDOM_PROMPTS = [
  "A retro 90s website dancing gif style animation",
  "Cyberpunk computer screen showing .gif format loading",
  "Animated pixel art of a looping dancing robot",
  "Retro flame text saying $.gif on a black background",
  "A rotating 3D dollar sign in low-res 256 colors",
  "Windows 98 error message box floating in space",
  "A retro computer monitor with a glitchy animation",
  "90s vaporwave aesthetic with a spinning floppy disk"
];

export const MemeGeneratorContent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready.');
  const imageRef = useRef<HTMLImageElement>(null);

  const getApiKey = () => {
    try {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env.API_KEY) {
            // @ts-ignore
            return window.process.env.API_KEY;
        }
        return '';
    } catch (e) {
        return '';
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setStatus('Initializing Neural Network...');

    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error("API Key missing. Cannot initialize .gif engine.");

      const ai = new GoogleGenAI({ apiKey });
      setStatus('Encoding Pixels...');
      
      const contents = {
          parts: [{
              text: `Generate a high-contrast pixel art image that looks like a retro 90s .gif. 
              Aesthetic: Windows 98, 256 colors, dithered gradients, retro, pixelated. 
              Scenario: ${prompt}. 
              Make it look like something you would find on a GeoCities homepage.`
          }]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents
      });

      let foundImage = false;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64String = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/jpeg';
                setGeneratedImage(`data:${mimeType};base64,${base64String}`);
                foundImage = true;
                break;
            }
        }
      }

      if (!foundImage) throw new Error("Output format not supported by current drivers.");
      setStatus('Done.');
    } catch (err: any) {
      setError(err.message || "Hardware Failure.");
      setStatus('Error.');
    } finally {
      setIsLoading(false);
    }
  };

  const setRandomPrompt = () => {
    const random = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(random);
  };

  const downloadAsJpeg = () => {
    if (!generatedImage) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.download = `meme_${Date.now()}.jpeg`;
        link.href = jpegUrl;
        link.click();
    };
    img.src = generatedImage;
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] p-2 font-mono">
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-b-[#808080] border-r-[#808080] mb-2 shrink-0">
        <label className="block text-sm mb-1">Enter .gif description:</label>
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-16 p-2 mb-2 text-sm border-2 border-inset border-[#808080] outline-none resize-none"
            placeholder="e.g. A spinning dollar sign..."
            disabled={isLoading}
        />
        <div className="flex gap-2 justify-end">
            <Button98 onClick={setRandomPrompt} disabled={isLoading} className="text-sm">🎲 Random</Button98>
            <Button98 onClick={handleGenerate} disabled={isLoading || !prompt} className="font-bold text-sm min-w-[100px]">
                {isLoading ? 'Encoding...' : 'Render 🎨'}
            </Button98>
        </div>
      </div>

      <div className="bg-white border-inset border-2 border-[#808080] px-2 py-1 mb-2 text-xs flex justify-between">
          <span>SYSTEM: {status}</span>
          {isLoading && <span className="animate-pulse">|||||||||</span>}
      </div>

      <div className="flex-1 bg-[#808080] border-2 border-inset border-white p-4 flex items-center justify-center overflow-auto min-h-[200px] relative">
        {error ? (
            <div className="bg-white p-4 border border-red-600 text-red-600 text-center max-w-[80%] z-10">
                <p className="font-bold">GENERAL PROTECTION FAULT</p>
                <p className="text-sm">{error}</p>
            </div>
        ) : generatedImage ? (
            <div className="flex flex-col items-center gap-2 w-full h-full justify-center">
                <div className="relative border-4 border-white shadow-lg bg-gray-300">
                    <img 
                        ref={imageRef}
                        src={generatedImage} 
                        alt="Generated" 
                        className="max-w-full max-h-[300px] object-contain block"
                    />
                </div>
                <Button98 onClick={downloadAsJpeg} className="text-sm mt-2">💾 Save as Image</Button98>
            </div>
        ) : (
            <div className="text-white/50 text-center z-10">
                <div className="text-4xl mb-2">📼</div>
                <p>Insert Prompt Disk...</p>
            </div>
        )}
      </div>
    </div>
  );
};