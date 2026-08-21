"use client";

/**
 * Full-bleed responsive background with optimized format cascade:
 *   AVIF → WebP → JPEG (per breakpoint)
 *
 * Run `npm run images:optimize` after adding masters to /public
 * to generate .avif / .webp siblings.
 */

import Image from "next/image";

export type ResponsiveBackgroundProps = {
  desktopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
};

function stem(src: string) {
  return src.replace(/\.(jpe?g|png|webp|avif)$/i, "");
}

export function ResponsiveBackground({
  desktopSrc = "/Background.jpg",
  tabletSrc = "/Background-Tablet.jpg",
  mobileSrc = "/Background-Mobile.jpg",
  alt = "",
  priority = false,
  className = "absolute inset-0 -z-10 overflow-hidden",
  imageClassName = "object-cover object-center",
  children,
}: ResponsiveBackgroundProps) {
  const mobile = stem(mobileSrc);
  const tablet = stem(tabletSrc);
  const desktop = stem(desktopSrc);

  return (
    <div className={className} aria-hidden={alt === "" ? true : undefined}>
      <picture>
        {/* Mobile */}
        <source
          media="(max-width: 767px)"
          type="image/avif"
          srcSet={`${mobile}.avif`}
        />
        <source
          media="(max-width: 767px)"
          type="image/webp"
          srcSet={`${mobile}.webp`}
        />
        <source media="(max-width: 767px)" srcSet={mobileSrc} />

        {/* Tablet */}
        <source
          media="(max-width: 1023px)"
          type="image/avif"
          srcSet={`${tablet}.avif`}
        />
        <source
          media="(max-width: 1023px)"
          type="image/webp"
          srcSet={`${tablet}.webp`}
        />
        <source media="(max-width: 1023px)" srcSet={tabletSrc} />

        {/* Desktop AVIF / WebP before next/image JPEG fallback */}
        <source type="image/avif" srcSet={`${desktop}.avif`} />
        <source type="image/webp" srcSet={`${desktop}.webp`} />

        <Image
          src={desktopSrc}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes="100vw"
          quality={85}
          className={imageClassName}
        />
      </picture>
      {children}
    </div>
  );
}
