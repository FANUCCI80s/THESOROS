import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-gold"
          >
            THÉSOROS
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="py-6 text-center text-xs text-foreground-subtle">
        © {new Date().getFullYear()} THÉSOROS. All rights reserved.
      </footer>
    </div>
  );
}
