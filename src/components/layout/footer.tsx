import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-elevated">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-gold"
            >
              THÉSOROS
            </Link>
            <p className="mt-3 max-w-sm text-sm text-foreground-muted leading-relaxed">
              A premium investment and wealth-management platform. Secure
              crypto deposits, curated plans, and transparent plan-based
              performance.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li>
                <a href="#how-it-works" className="hover:text-gold transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-gold transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li>
                <Link href="/privacy" className="hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground-subtle">
            © {new Date().getFullYear()} THÉSOROS. All rights reserved.
          </p>
          <p className="text-xs text-foreground-subtle">
            Investment involves risk. Past performance is not indicative of
            future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
