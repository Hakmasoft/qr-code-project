import Link from 'next/link'

const TOPICS = [
  { slug: 'peace', label: 'Peace' },
  { slug: 'purpose', label: 'Purpose' },
  { slug: 'identity', label: 'Identity' },
  { slug: 'hope', label: 'Hope' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-[420px] flex flex-col gap-10 animate-[fadeIn_400ms_ease-out]">

        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-[32px] leading-[1.15] tracking-[-0.01em] text-text-primary">
            The Hub
          </h1>
          <p className="text-sm text-text-secondary">
            Short films for whatever you&apos;re carrying.
          </p>
        </header>

        <nav className="flex flex-col gap-3">
          {TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              href={`/${topic.slug}`}
              className="rounded-card border border-border bg-surface px-5 py-4 text-base text-text-primary transition hover:border-accent"
            >
              {topic.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-text-secondary">
          Something missing? Reach out from any page.
        </p>

      </div>
    </main>
  )
}