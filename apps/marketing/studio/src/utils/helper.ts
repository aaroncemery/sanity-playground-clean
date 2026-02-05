/**
 * Determines the presentation URL based on the current environment.
 * Uses localhost:3000 for development and when SANITY_STUDIO_PRESENTATION_URL is not set.
 * In production, uses SANITY_STUDIO_PRESENTATION_URL if available, otherwise falls back to localhost.
 */
export const getPresentationUrl = () => {
  // Check for explicit environment variable first
  const presentationUrl = process.env.SANITY_STUDIO_PRESENTATION_URL
  if (presentationUrl) {
    return presentationUrl
  }

  // Default to localhost:3000 for development and fallback scenarios
  // This covers development, typegen, and cases where the env var isn't set
  return 'http://localhost:3000'
}
