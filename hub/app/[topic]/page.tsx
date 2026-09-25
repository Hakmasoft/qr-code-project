'use client'

import { useEffect, useRef, useState } from 'react'
import Form from './Form'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const VIDEO_ID = 'NABBNcYjNnM'

const surfaceLine = 'What if you\u2019re not as alone as it feels at 2am?'

// Hardcoded for the pilot — shaped like a future Supabase `events` row
// so this can be lifted into a real query later with minimal changes.
type ServiceEvent = {
  id: string
  dayIndex: number // 0 = Sunday ... 6 = Saturday, matches Date.getDay()
  dayLabel: string
  timeLabel: string
  title: string
}

const SERVICES: ServiceEvent[] = [
  {
    id: 'thursday-service',
    dayIndex: 4,
    dayLabel: 'Thursday',
    timeLabel: '5:00 – 9:30pm',
    title: 'Midweek Service',
  },
  {
    id: 'sunday-service',
    dayIndex: 0,
    dayLabel: 'Sunday',
    timeLabel: '11:00am – 1:30pm',
    title: 'Sunday Service',
  },
]

// Lives at /public/images/sunday-thur-ad.jpg — served at this path.
const AD_IMAGE_SRC = '/images/invite.jpg'

// Orders services by how soon they occur from today, so whichever is
// coming up next always appears first — still fully hardcoded data,
// just presented with a little relevance.
function getOrderedServices(events: ServiceEvent[], today = new Date().getDay()) {
  return [...events].sort((a, b) => {
    const daysUntilA = (a.dayIndex - today + 7) % 7
    const daysUntilB = (b.dayIndex - today + 7) % 7
    return daysUntilA - daysUntilB
  })
}

// Builds accessible alt text from the same data driving the ordering,
// so the image isn't just a decorative, unlabeled graphic.
function buildAdImageAlt(events: ServiceEvent[]) {
  return `Invitation flyer: ${events
    .map((service) => `${service.title}, ${service.dayLabel} ${service.timeLabel}`)
    .join(' and ')}`
}

export default function TopicPage() {
  const [showAd, setShowAd] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const orderedServices = getOrderedServices(SERVICES)
  const adImageAlt = buildAdImageAlt(orderedServices)

  useEffect(() => {
    function createPlayer() {
      if (!containerRef.current || playerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setShowAd(true)
            }
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      createPlayer()
    } else {
      window.onYouTubeIframeAPIReady = createPlayer
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  }, [])

  function handleSoundOn() {
    if (playerRef.current && playerRef.current.unMute) {
      playerRef.current.unMute()
      playerRef.current.setVolume(100)
      setIsMuted(false)
    }
  }

  function handleTalkToSomeone() {
    setShowAd(false)
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handlePlayAgain() {
    setShowAd(false)
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(0, true)
      playerRef.current.playVideo()
    }
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

        <div className="relative w-full aspect-[9/16] rounded-card overflow-hidden bg-black">
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />

          {!showAd && isMuted && (
            <button
              type="button"
              onClick={handleSoundOn}
              aria-label="Turn sound on"
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 text-white text-xs px-3 py-1.5 backdrop-blur-sm transition hover:bg-black/70"
            >
              Sound on
            </button>
          )}
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

      {showAd && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black animate-[fadeIn_300ms_ease-out]">
          <div className="flex-1 min-h-0 flex items-center justify-center p-4">
            <img
              src={AD_IMAGE_SRC}
              alt={adImageAlt}
              className="max-w-full max-h-full object-contain rounded-card"
            />
          </div>

          <div className="flex-shrink-0 w-full max-w-[420px] mx-auto px-6 pb-8 pt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleTalkToSomeone}
              className="rounded-control bg-accent px-4 py-3 text-sm text-white transition hover:bg-accent-hover"
            >
              Talk to someone →
            </button>
            <button
              type="button"
              onClick={handlePlayAgain}
              className="rounded-control px-4 py-3 text-sm text-white/70 transition hover:text-white"
            >
              Play again
            </button>
          </div>
        </div>
      )}
    </main>
  )
}