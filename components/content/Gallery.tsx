import React from 'react';

export const GalleryContent: React.FC = () => {
    // Generate some deterministic random images
    const images = [100, 101, 102, 103, 104, 105].map(id => `https://picsum.photos/id/${id}/300/300`);

  return (
    <div className="bg-black p-2 h-full overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
            {images.map((src, i) => (
                <div key={i} className="bg-[#c0c0c0] p-1 border border-white">
                    <img src={src} alt={`Meme ${i}`} className="w-full h-auto grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                    <p className="text-center text-xs mt-1 font-mono truncate">giraffe_{i}.gif</p>
                </div>
            ))}
        </div>
    </div>
  );
};