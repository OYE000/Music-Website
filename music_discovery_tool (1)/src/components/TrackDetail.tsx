import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

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

interface TrackDetailProps {
  track: SpotifyTrack;
  onBack: () => void;
}

export function TrackDetail({ track, onBack }: TrackDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isFavorited = useQuery(api.favorites.isFavorited, { spotifyTrackId: track.id });
  const addToFavorites = useMutation(api.favorites.addToFavorites);
  const removeFromFavorites = useMutation(api.favorites.removeFromFavorites);

  const albumImage = track.album.images[0]?.url;
  const artistNames = track.artists.map(artist => artist.name).join(', ');
  const releaseDate = new Date(track.album.release_date).toLocaleDateString();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !track.preview_url) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorited) {
        await removeFromFavorites({ spotifyTrackId: track.id });
        toast.success("Removed from favorites");
      } else {
        await addToFavorites({ 
          spotifyTrackId: track.id,
          trackData: {
            ...track,
            preview_url: track.preview_url || undefined
          }
        });
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Discovery
        </button>
        
        <button
          onClick={handleFavoriteToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            isFavorited
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <svg className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
        {/* Hero Section */}
        <div className="relative p-8 bg-gradient-to-br from-purple-600/20 to-blue-600/20">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Album Art */}
            <div className="flex-shrink-0">
              {albumImage ? (
                <img
                  src={albumImage}
                  alt={track.album.name}
                  className="w-64 h-64 object-cover rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-24 h-24 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{track.name}</h1>
                <p className="text-2xl text-white/80 mb-4">{artistNames}</p>
                <div className="flex flex-wrap gap-4 text-white/60">
                  <span>{track.album.name}</span>
                  <span>•</span>
                  <span>{releaseDate}</span>
                  <span>•</span>
                  <span>{Math.floor(track.duration_ms / 60000)}:{Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Popularity */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Popularity</span>
                  <span>{track.popularity}/100</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${track.popularity}%` }}
                  />
                </div>
              </div>

              {/* Audio Preview */}
              {track.preview_url && (
                <div className="space-y-4">
                  <audio ref={audioRef} src={track.preview_url} />
                  
                  {/* Play Button */}
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                    {isPlaying ? "Pause Preview" : "Play Preview"}
                  </button>

                  {/* Progress Bar */}
                  {duration > 0 && (
                    <div className="space-y-2">
                      <div 
                        className="w-full bg-white/20 rounded-full h-2 cursor-pointer"
                        onClick={handleSeek}
                      >
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-100"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-white/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* External Links */}
              <div className="flex gap-4">
                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Open in Spotify
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
