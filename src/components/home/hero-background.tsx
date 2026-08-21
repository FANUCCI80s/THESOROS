/**
 * Responsive hero background for THÉSOROS landing page.
 *
 * Controlled by CSS media queries in globals.css:
 *   < 768px   → background-mobile.*
 *   768–1023  → background-tablet.*
 *   ≥ 1024    → background.* / Background.jpg
 *
 * Place files in /public. Missing files fall back to dark #0a0a0a.
 * Only the hero uses these images — other sections stay near-black.
 */

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="hero-bg absolute inset-0" />
      <div className="hero-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--gold-muted)_0%,_transparent_55%)] opacity-30" />
    </div>
  );
}
