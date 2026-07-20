'use client'

import { useEffect, useRef } from 'react'

interface SubtitleEntry {
  id: string
  index: number
  startTime: number
  endTime: number
  ko: string
  zh: string
}

interface SubtitlePanelProps {
  subtitles: SubtitleEntry[]
  currentTime: number
  onSeek?: (time: number) => void
  fontSize?: 'small' | 'medium' | 'large'
}

export function SubtitlePanel({
  subtitles,
  currentTime,
  onSeek,
  fontSize = 'medium'
}: SubtitlePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  const activeIndex = subtitles.findIndex(
    entry => currentTime >= entry.startTime && currentTime <= entry.endTime
  )

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current
      const element = activeRef.current
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [activeIndex])

  const fontSizeClasses = {
    small: { ko: 'text-base', zh: 'text-sm' },
    medium: { ko: 'text-lg', zh: 'text-base' },
    large: { ko: 'text-xl', zh: 'text-lg' }
  }

  const handleEntryClick = (entry: SubtitleEntry) => {
    onSeek?.(entry.startTime)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">Subtitles</h3>
      </div>

      <div
        ref={containerRef}
        className="overflow-y-auto max-h-[400px] p-4 space-y-3"
      >
        {subtitles.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No subtitles available</p>
        ) : (
          subtitles.map((entry, idx) => {
            const isActive = idx === activeIndex
            return (
              <div
                key={entry.id}
                ref={isActive ? activeRef : null}
                onClick={() => handleEntryClick(entry)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className={`${fontSizeClasses[fontSize].ko} font-medium mb-1 ${
                  isActive ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {entry.ko}
                </div>
                <div className={`${fontSizeClasses[fontSize].zh} ${
                  isActive ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {entry.zh}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
