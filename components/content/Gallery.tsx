import React from 'react';

export const GalleryContent: React.FC = () => {
    // Specific list of gifs
    const images = [
        "https://media.tenor.com/1Kpisj-ZnLAAAAAM/giraffe-eating.gif",
        "https://media.tenor.com/v8kalLw21eUAAAAM/bleh.gif",
        "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyZ3VudHdkZ2JkOGp2b2VyYnNhMmRnaG04MGhrbWVmaTc5OHlzcGZnaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1gOadI4RGkrFpbMF7r/giphy-downsized.gif",
        "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyamJ0enRqbThpdW1uYmdzOGh6NHBxdmNuM3hlajYycTQyZHRtODk3bCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/gAdxI2AjB3cRy/200.gif",
        "https://i.pinimg.com/originals/dc/a5/8f/dca58fc1e50e1884e4078c0200434f94.gif"
    ];

  return (
    <div className="bg-black p-2 h-full overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
            {images.map((src, i) => (
                <div key={i} className="bg-[#c0c0c0] p-1 border border-white">
                    <img src={src} alt={`Giraffe GIF ${i}`} className="w-full h-auto cursor-crosshair object-cover" />
                    <p className="text-center text-xs mt-1 font-mono truncate">giraffe_{i + 1}.gif</p>
                </div>
            ))}
        </div>
    </div>
  );
};