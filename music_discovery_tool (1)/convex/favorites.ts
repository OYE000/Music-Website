import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addToFavorites = mutation({
  args: { 
    spotifyTrackId: v.string(),
    trackData: v.object({
      id: v.string(),
      name: v.string(),
      artists: v.array(v.object({
        id: v.string(),
        name: v.string(),
      })),
      album: v.object({
        id: v.string(),
        name: v.string(),
        images: v.array(v.object({
          url: v.string(),
          height: v.optional(v.number()),
          width: v.optional(v.number()),
        })),
        release_date: v.string(),
      }),
      duration_ms: v.number(),
      preview_url: v.optional(v.string()),
      external_urls: v.object({
        spotify: v.string(),
      }),
      popularity: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to add favorites");
    }

    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_track", (q) => 
        q.eq("userId", userId).eq("spotifyTrackId", args.spotifyTrackId)
      )
      .unique();

    if (existing) {
      throw new Error("Track already in favorites");
    }

    return await ctx.db.insert("favorites", {
      userId,
      spotifyTrackId: args.spotifyTrackId,
      trackData: args.trackData,
    });
  },
});

export const removeFromFavorites = mutation({
  args: { spotifyTrackId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to remove favorites");
    }

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_track", (q) => 
        q.eq("userId", userId).eq("spotifyTrackId", args.spotifyTrackId)
      )
      .unique();

    if (!favorite) {
      throw new Error("Track not in favorites");
    }

    await ctx.db.delete(favorite._id);
  },
});

export const getUserFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return favorites.map(fav => fav.trackData);
  },
});

export const isFavorited = query({
  args: { spotifyTrackId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_track", (q) => 
        q.eq("userId", userId).eq("spotifyTrackId", args.spotifyTrackId)
      )
      .unique();

    return !!favorite;
  },
});
