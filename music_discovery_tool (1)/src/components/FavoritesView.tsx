import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrackCard } from "./TrackCard";

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

interface FavoritesViewProps {
  onTrackClick: (track: SpotifyTrack) => void;
}

export function FavoritesView({ onTrackClick }: FavoritesViewProps) {
  const favorites = useQuery(api.favorites.getUserFavorites);

  if (favorites === undefined) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
        <p className="text-white/60">Start exploring and add tracks to your favorites!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Your Favorites</h2>
        <p className="text-white/60">{favorites.length} tracks saved</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            onClick={() => onTrackClick(track)}
          />
        ))}
      </div>
    </div>
  );
}
