export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[var(--background-gradient)]">
      <div className="glass-panel p-12 text-center max-w-lg animate-float">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-brand-pink via-brand-lavender to-brand-sky bg-clip-text text-transparent mb-4">
          ACCESSIBLE AI 🌈
        </h1>
        <p className="text-lg text-slate-700 font-medium mb-6">
          Making the world accessible before people arrive.
        </p>
        <span className="inline-block px-4 py-2 bg-brand-mint text-emerald-800 text-sm font-semibold rounded-full shadow-sm">
          ✓ Phase 1 Foundation Active
        </span>
      </div>
    </main>
  );
}
