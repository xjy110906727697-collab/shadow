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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {level && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              {level}
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(duration)}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-blue-600">
            {titleZh}
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">{title}</p>
          {(descriptionZh || description) && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {descriptionZh || description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
