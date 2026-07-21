'use client'

import { useEffect, useRef, useState } from 'react'

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
  mode?: '双语' | '韩文' | '中文' | '盲听'
  onModeChange?: (mode: '双语' | '韩文' | '中文' | '盲听') => void
  isFavorited?: boolean
  onFavoriteToggle?: () => void
}

const subtitleModes = ['双语', '韩文', '中文', '盲听'] as const

export function SubtitlePanel({
  subtitles,
  currentTime,
  onSeek,
  mode = '双语',
  onModeChange,
  isFavorited,
  onFavoriteToggle,
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

      // Scroll active subtitle to upper area (20% from top)
      const targetTop = container.scrollTop + elementRect.top - containerRect.top - containerRect.height * 0.2
      container.scrollTo({ top: targetTop, behavior: 'smooth' })
    }
  }, [activeIndex])

  const handleEntryClick = (entry: SubtitleEntry) => {
    onSeek?.(entry.startTime)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      {/* Header with mode switches + favorite - flush to edges */}
      <div className="border-b border-gray-200 shrink-0">
        <div className="flex items-stretch w-full">
          {/* Segmented control for mode buttons */}
          <div className="flex flex-1 overflow-hidden">
            {subtitleModes.map((m, i) => (
              <button
                key={m}
                onClick={() => onModeChange?.(m)}
                className={`flex-1 text-[11px] py-2.5 transition-colors text-center ${
                  mode === m
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                } ${i > 0 ? 'border-l border-gray-200' : ''}`}
              >
                {m}
              </button>
            ))}
          </div>
          {onFavoriteToggle && (
            <button
              onClick={onFavoriteToggle}
              className={`flex-shrink-0 w-9 flex items-center justify-center border-l border-gray-200 transition-colors ${
                isFavorited
                  ? 'bg-red-50 text-red-500'
                  : 'bg-white text-gray-400 hover:text-red-400'
              }`}
            >
              <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-y-auto flex-1 p-4 space-y-3"
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
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-400 font-mono">{formatTime(entry.startTime)}</span>
                  {isActive && (
                    <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                      正在播放
                    </span>
                  )}
                </div>
                {mode === '盲听' ? (
                  <>
                    <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </>
                ) : mode === '中文' ? (
                  <div className={`text-base ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                    {entry.zh}
                  </div>
                ) : mode === '韩文' ? (
                  <div className={`text-lg font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {entry.ko}
                  </div>
                ) : (
                  <>
                    <div className={`text-lg font-medium mb-1 ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {entry.ko}
                    </div>
                    <div className={`text-base ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                      {entry.zh}
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
