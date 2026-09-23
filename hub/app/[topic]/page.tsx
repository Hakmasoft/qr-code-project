import Script from 'next/script'
import Form from './Form'

const TEST_VIDEO_URL =
  'https://www.tiktok.com/@the.god.life/video/7672446946123975944?lang=en&q=The%20God%20Life&t=1790161856986'

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>
}) {
  const { topic } = await params

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 bg-white text-gray-900">
      <div className="w-full max-w-md flex flex-col gap-6">

        <div className="flex justify-center">
          <blockquote
            className="tiktok-embed"
            cite={TEST_VIDEO_URL}
            data-video-id={TEST_VIDEO_URL.split('/').pop()}
            style={{ maxWidth: '325px', minWidth: '325px' }}
          >
            <section>
              <a target="_blank" href={TEST_VIDEO_URL} rel="noreferrer noopener">
                Watch on TikTok
              </a>
            </section>
          </blockquote>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">What&apos;s happening now</p>
          <p className="text-base">Season ad will appear here.</p>
        </div>

        <Form
          topic={topic}
          slug={`${topic}-01`}
          surfaceSource="pilot-test"
        />

      </div>

      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="afterInteractive"
      />
    </main>
  )
}