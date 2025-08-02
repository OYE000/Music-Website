import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrackCard } from "./TrackCard";
import { TrackDetail } from "./TrackDetail";
import { SearchBar } from "./SearchBar";
import { FavoritesView } from "./FavoritesView";

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

export function MusicDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [activeTab, setActiveTab] = useState<"discover" | "favorites">("discover");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([]);

  const searchTracks = useAction(api.spotify.searchTracks);
  const getRecommendations = useAction(api.spotify.getRecommendations);
  const favorites = useQuery(api.favorites.getUserFavorites);

  // Load initial recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const recs = await getRecommendations({
          seed_genres: ["pop", "rock", "indie"],
          limit: 20,
        });
        setRecommendations(recs.tracks);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "discover" && !searchQuery && recommendations.length === 0) {
      loadRecommendations();
    }
  }, [activeTab, searchQuery, getRecommendations, recommendations.length]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await searchTracks({ query, limit: 20 });
      setSearchResults(results.tracks);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedTrack) {
    return (
      <TrackDetail 
        track={selectedTrack} 
        onBack={() => setSelectedTrack(null)} 
      />
    );
  }

  const displayTracks = searchQuery ? searchResults : recommendations;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "discover"
                ? "bg-white text-slate-900 shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "favorites"
                ? "bg-white text-slate-900 shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Favorites ({favorites?.length || 0})
          </button>
        </div>
      </div>

      {activeTab === "discover" ? (
        <>
          {/* Search */}
          <SearchBar onSearch={handleSearch} />

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white"></div>
            </div>
          ) : (
            <>
              {searchQuery && (
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-white/60">{searchResults.length} tracks found</p>
                </div>
              )}

              {!searchQuery && recommendations.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Recommended for You
                  </h2>
                  <p className="text-white/60">Discover new music based on popular trends</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onClick={() => setSelectedTrack(track)}
                  />
                ))}
              </div>

              {displayTracks.length === 0 && !isLoading && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchQuery ? "No tracks found" : "Start discovering music"}
                  </h3>
                  <p className="text-white/60">
                    {searchQuery 
                      ? "Try a different search term"
                      : "Search for your favorite artists or songs"
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <FavoritesView onTrackClick={setSelectedTrack} />
      )}
    </div>
  );
}
