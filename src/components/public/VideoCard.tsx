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
}: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Link href={`/video/${id}`} className="group">
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
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
