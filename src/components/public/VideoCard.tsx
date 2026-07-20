import Link from 'next/link'
import Image from 'next/image'

interface VideoCardProps {
  id: string
  title: string
  titleZh: string
  description?: string | null
  descriptionZh?: string | null
  coverUrl: string
  duration: number
  level?: string | null
  visitorAccessible?: boolean
  isVisitor?: boolean
}

export function VideoCard({
  id,
  title,
  titleZh,
  description,
  descriptionZh,
  coverUrl,
  duration,
  level,
  visitorAccessible,
  isVisitor,
}: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isLocked = isVisitor && !visitorAccessible

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault()
      const event = new CustomEvent('video-locked')
      window.dispatchEvent(event)
    }
  }

  return (
    <Link href={`/video/${id}`} className="group" onClick={handleClick}>
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow relative">
        <div className="relative aspect-video bg-gray-200">
          <Image
            src={coverUrl}
            alt={titleZh}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
          {level && (
            <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
              {level}
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(duration)}
          </div>
        </div>
        <div className="p-2">
          <h3 className="font-semibold text-sm mb-0.5 line-clamp-1 group-hover:text-blue-600">
            {titleZh}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">{title}</p>
        </div>
      </div>
    </Link>
  )
}
