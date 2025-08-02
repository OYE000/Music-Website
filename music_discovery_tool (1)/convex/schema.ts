import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  favorites: defineTable({
    userId: v.id("users"),
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
  })
    .index("by_user", ["userId"])
    .index("by_user_and_track", ["userId", "spotifyTrackId"]),
  
  playlists: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    tracks: v.array(v.string()), // Spotify track IDs
  })
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
