import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";

import { clientConfig } from "./client";
import { token } from "./token";

/**
 * Client configured for live preview with Presentation Tool
 * Inherits shared configuration from client.ts
 */
const liveClient = createClient(clientConfig);

/**
 * Live preview utilities for draft mode and visual editing
 * - sanityFetch: Use this in Server Components during draft mode
 * - SanityLive: Add this component to your layout for live updates
 */
export const { sanityFetch, SanityLive } = defineLive({
  client: liveClient,
  serverToken: token,
  browserToken: token,
});
