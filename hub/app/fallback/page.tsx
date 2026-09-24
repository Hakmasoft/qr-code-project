export default function FallbackPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-[420px] flex flex-col gap-6 animate-[fadeIn_400ms_ease-out]">

        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-[32px] leading-[1.15] tracking-[-0.01em] text-text-primary">
            Almost there.
          </h1>
          <p className="text-sm text-text-secondary">
            This link isn&apos;t active right now. It may have expired, or it may not have been set up yet.
          </p>
        </header>

        <a
          href="/"
          className="rounded-control border border-border bg-surface px-4 py-3 text-sm text-text-primary text-center transition hover:border-accent"
        >
          See what&apos;s here →
        </a>

      </div>
    </main>
  )
}