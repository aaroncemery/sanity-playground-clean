import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type {
  SanityImageMetadata,
  SanityImageDimensions,
  SanityImagePalette,
} from "./sanity.types";

type SanityImageWithMetadata = {
  asset?: {
    metadata?:
      | SanityImageMetadata
      | {
          dimensions?: SanityImageDimensions | null;
          lqip?: string | null;
          blurHash?: string | null;
          palette?: SanityImagePalette | null;
        }
      | null;
  } | null;
} | null;

const builder = imageUrlBuilder(client);

/**
 * Generate optimized image URLs using @sanity/image-url
 * Automatically applies format optimization (WebP/AVIF)
 *
 * @example
 * urlFor(image).width(800).height(600).url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format");
}

/**
 * Get blur data URL for Next.js Image placeholder
 * Uses blurHash if available (modern), falls back to lqip (legacy)
 *
 * @param image - Image object from Sanity query with metadata
 * @returns Base64 data URI for blur placeholder, or undefined
 *
 * @example
 * <Image
 *   src={urlFor(image).width(800).url()}
 *   placeholder="blur"
 *   blurDataURL={getImageBlurData(image)}
 * />
 */
export function getImageBlurData(
  image: SanityImageWithMetadata,
): string | undefined {
  // Prefer blurHash (modern, better quality)
  if (image?.asset?.metadata?.blurHash) {
    return image.asset.metadata.blurHash;
  }

  // Fallback to lqip (legacy base64 image)
  if (image?.asset?.metadata?.lqip) {
    return image.asset.metadata.lqip;
  }

  return undefined;
}

/**
 * Get image dimensions for aspect ratio
 * Prevents layout shift in Next.js Image
 *
 * @param image - Image object from Sanity query with metadata
 * @returns Object with width and height, or default 16:9
 */
export function getImageDimensions(image: SanityImageWithMetadata): {
  width: number;
  height: number;
} {
  const width = image?.asset?.metadata?.dimensions?.width;
  const height = image?.asset?.metadata?.dimensions?.height;

  if (width && height) {
    return { width, height };
  }

  // Default to 16:9 aspect ratio if dimensions not available
  return { width: 1600, height: 900 };
}

/**
 * Get dominant color from image palette
 * Useful for themed backgrounds or loading states
 *
 * @param image - Image object from Sanity query with metadata
 * @returns Hex color string, or undefined
 */
export function getImageDominantColor(
  image: SanityImageWithMetadata,
): string | undefined {
  return image?.asset?.metadata?.palette?.dominant?.background;
}
