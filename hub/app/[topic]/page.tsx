'use client'

import Script from 'next/script'
import { useRef, useState } from 'react'
import Form from './Form'

const TEST_VIDEO_URL =
  'https://www.tiktok.com/@tiktok/video/7106594312292453675'

export default function TopicPage() {
  const [showAd, setShowAd] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const surfaceLine = 'What if you\u2019re not as alone as it feels at 2am?'

  function handleTalkToSomeone() {
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-[420px] flex flex-col gap-8 animate-[fadeIn_400ms_ease-out]">

        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-[32px] leading-[1.15] tracking-[-0.01em] text-text-primary">
            {surfaceLine}
          </h1>
          <p className="text-sm text-text-secondary">
            Here&apos;s what&apos;s behind it.
          </p>
        </header>

        <div className="relative flex justify-center">
          <blockquote
            className="tiktok-embed"
            cite={TEST_VIDEO_URL}
            data-video-id={TEST_VIDEO_URL.split('/').pop()}
            style={{ maxWidth: '100%', minWidth: '100%' }}
          >
            <section>
              <a target="_blank" href={TEST_VIDEO_URL} rel="noreferrer noopener">
                Watch on TikTok
              </a>
            </section>
          </blockquote>

          <button
            type="button"
            aria-label="Sound on"
            className="absolute top-3 right-3 rounded-full bg-black/60 text-white text-xs px-3 py-1.5 backdrop-blur-sm"
          >
            Sound on
          </button>
        </div>

        {!showAd && (
          <button
            type="button"
            onClick={() => setShowAd(true)}
            className="w-full rounded-control border border-border bg-surface px-4 py-3 text-sm text-text-primary transition hover:border-accent"
          >
            What&apos;s next →
          </button>
        )}

        {showAd && (
          <div className="rounded-card border border-border bg-surface p-5 flex flex-col gap-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary">
              What&apos;s happening now
            </p>
            <p className="font-serif text-xl leading-snug text-text-primary">
              A room full of people exploring the same things. This Sunday.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleTalkToSomeone}
                className="rounded-control bg-accent px-4 py-3 text-sm text-white transition hover:bg-accent-hover"
              >
                Talk to someone →
              </button>
              <button
                type="button"
                onClick={() => setShowAd(false)}
                className="rounded-control px-4 py-3 text-sm text-text-secondary transition hover:text-text-primary"
              >
                Play again
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div ref={formRef}>
            <Form
              topic="peace"
              slug="peace-01"
              surfaceSource="pilot-test"
            />
          </div>
        )}

      </div>

      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="afterInteractive"
      />
    </main>
  )
}