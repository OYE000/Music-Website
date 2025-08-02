"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Get access token for client credentials flow (no user auth needed for search)
async function getAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    return data.body.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to authenticate with Spotify');
  }
}

export const searchTracks = action({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await getAccessToken();
    
    try {
      const results = await spotifyApi.searchTracks(args.query, {
        limit: args.limit || 20,
        offset: args.offset || 0,
      });

      return {
        tracks: results.body.tracks?.items.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => ({
            id: artist.id,
            name: artist.name,
          })),
          album: {
            id: track.album.id,
            name: track.album.name,
            images: track.album.images,
            release_date: track.album.release_date,
          },
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          popularity: track.popularity,
        })) || [],
        total: results.body.tracks?.total || 0,
      };
    } catch (error) {
      console.error('Error searching tracks:', error);
      throw new Error('Failed to search tracks');
    }
  },
});

export const getTrackById = action({
  args: { trackId: v.string() },
  handler: async (ctx, args) => {
    await getAccessToken();
    
    try {
      const track = await spotifyApi.getTrack(args.trackId);
      const audioFeatures = await spotifyApi.getAudioFeaturesForTrack(args.trackId);
      
      return {
        id: track.body.id,
        name: track.body.name,
        artists: track.body.artists.map(artist => ({
          id: artist.id,
          name: artist.name,
        })),
        album: {
          id: track.body.album.id,
          name: track.body.album.name,
          images: track.body.album.images,
          release_date: track.body.album.release_date,
        },
        duration_ms: track.body.duration_ms,
        preview_url: track.body.preview_url,
        external_urls: track.body.external_urls,
        popularity: track.body.popularity,
        audio_features: audioFeatures.body,
      };
    } catch (error) {
      console.error('Error getting track:', error);
      throw new Error('Failed to get track details');
    }
  },
});

export const getRecommendations = action({
  args: {
    seed_tracks: v.optional(v.array(v.string())),
    seed_artists: v.optional(v.array(v.string())),
    seed_genres: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await getAccessToken();
    
    try {
      const recommendations = await spotifyApi.getRecommendations({
        seed_tracks: args.seed_tracks,
        seed_artists: args.seed_artists,
        seed_genres: args.seed_genres,
        limit: args.limit || 20,
      });

      return {
        tracks: recommendations.body.tracks.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => ({
            id: artist.id,
            name: artist.name,
          })),
          album: {
            id: track.album.id,
            name: track.album.name,
            images: track.album.images,
            release_date: track.album.release_date,
          },
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          popularity: track.popularity,
        })),
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  },
});

export const getGenres = action({
  args: {},
  handler: async (ctx) => {
    await getAccessToken();
    
    try {
      const genres = await spotifyApi.getAvailableGenreSeeds();
      return genres.body.genres;
    } catch (error) {
      console.error('Error getting genres:', error);
      throw new Error('Failed to get genres');
    }
  },
});
