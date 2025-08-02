import { useState } from "react";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height?: number; width?: number }>;
    release_date: string;
  };
  duration_ms: number;
  preview_url?: string | null;
  external_urls: { spotify: string };
  popularity: number;
}

interface TrackCardProps {
  track: SpotifyTrack;
  onClick: () => void;
}

export function TrackCard({ track, onClick }: TrackCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const albumImage = track.album.images[0]?.url;
  const artistNames = track.artists.map(artist => artist.name).join(', ');
  const releaseYear = new Date(track.album.release_date).getFullYear();

  return (
    <div
      onClick={onClick}
      className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl"
    >
      {/* Album Art */}
      <div className="relative mb-4 overflow-hidden rounded-xl">
        {albumImage && !imageError ? (
          <img
            src={albumImage}
            alt={track.album.name}
            className={`w-full aspect-square object-cover transition-all duration-300 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2 group-hover:text-green-400 transition-colors">
          {track.name}
        </h3>
        <p className="text-white/70 text-sm line-clamp-1">{artistNames}</p>
        <p className="text-white/50 text-xs line-clamp-1">{track.album.name}</p>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-white/40 text-xs">{releaseYear}</span>
          <span className="text-white/40 text-xs">{formatDuration(track.duration_ms)}</span>
        </div>
        
        {/* Popularity Bar */}
        <div className="w-full bg-white/10 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${track.popularity}%` }}
          />
        </div>
      </div>
    </div>
  );
}
