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
}

export function SubtitlePanel({
  subtitles,
  currentTime,
  onSeek,
}: SubtitlePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  const activeIndex = (subtitles ?? []).findIndex(
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

  const handleEntryClick = (entry: SubtitleEntry) => {
    onSeek?.(entry.startTime)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">字幕</h3>
      </div>

      <div
        ref={containerRef}
        className="overflow-y-auto max-h-[600px] p-4 space-y-3"
      >
        {!subtitles || subtitles.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无字幕</p>
        ) : (
          (subtitles ?? []).map((entry, idx) => {
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
                <div className={`text-lg font-medium mb-1 ${
                  isActive ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {entry.ko}
                </div>
                <div className={`text-base ${
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
