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
  const [blindRevealed, setBlindRevealed] = useState<Set<string>>(new Set())

  const toggleBlind = (id: string) => {
    setBlindRevealed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const activeIndex = (subtitles ?? []).findIndex(
    entry => currentTime >= entry.startTime && currentTime <= entry.endTime
  )

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current
      const element = activeRef.current
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* 顶部栏：圆角模式切换 + 收藏爱心 */}
      <div className="shrink-0 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {/* 圆角分段控件 */}
          <div className="flex flex-1 bg-gray-200/80 rounded-lg p-0.5 gap-0.5">
            {subtitleModes.map(m => (
              <button
                key={m}
                onClick={() => onModeChange?.(m)}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all text-center font-medium ${
                  mode === m
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* 收藏爱心按钮 */}
          {onFavoriteToggle && (
            <button
              onClick={onFavoriteToggle}
              className={`flex-shrink-0 w-9 h-9 flex items-center justify-center transition-all ${
                isFavorited
                  ? 'text-red-500'
                  : 'bg-gray-50 text-gray-400 hover:text-red-400'
              }`}
            >
              <svg className="w-4.5 h-4.5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 字幕列表 */}
      <div
        ref={containerRef}
        className="overflow-y-auto flex-1 p-3 space-y-2"
      >
        {!subtitles || subtitles.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">暂无字幕</p>
        ) : (
          (subtitles ?? []).map((entry, idx) => {
            const isActive = idx === activeIndex
            return (
              <div
                key={entry.id}
                ref={isActive ? activeRef : null}
                onClick={() => {
                  if (mode === '盲听') { toggleBlind(entry.id); return }
                  handleEntryClick(entry)
                }}
                className={`px-3 py-3 rounded-lg cursor-pointer transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-b from-blue-50/90 via-blue-50/60 to-blue-50/90 border border-blue-300/60 shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {/* 顶部行：动态声波icon + 正在播放 */}
                {isActive ? (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="10" width="3" height="4" rx="1">
                        <animate attributeName="height" values="4;12;4" dur="0.8s" repeatCount="indefinite" />
                        <animate attributeName="y" values="10;6;10" dur="0.8s" repeatCount="indefinite" />
                      </rect>
                      <rect x="7.5" y="7" width="3" height="10" rx="1">
                        <animate attributeName="height" values="10;16;10" dur="0.6s" repeatCount="indefinite" />
                        <animate attributeName="y" values="7;4;7" dur="0.6s" repeatCount="indefinite" />
                      </rect>
                      <rect x="13" y="9" width="3" height="6" rx="1">
                        <animate attributeName="height" values="6;14;6" dur="0.7s" repeatCount="indefinite" />
                        <animate attributeName="y" values="9;5;9" dur="0.7s" repeatCount="indefinite" />
                      </rect>
                      <rect x="18" y="8" width="3" height="8" rx="1">
                        <animate attributeName="height" values="8;12;8" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="y" values="8;6;8" dur="0.5s" repeatCount="indefinite" />
                      </rect>
                    </svg>
                    <span className="text-[11px] text-blue-500 font-medium">正在播放</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 font-mono mb-1.5">{formatTime(entry.startTime)}</div>
                )}

                {/* 字幕内容 */}
                {mode === '盲听' ? (
                  <>
                    {blindRevealed.has(entry.id) ? (
                      <>
                        <div className={`text-base font-extrabold leading-relaxed tracking-wider mb-1 ${isActive ? 'text-gray-900' : 'text-gray-800'}`} style={{ wordSpacing: '0.15em' }}>
                          {entry.ko}
                        </div>
                        <div className={`text-sm leading-relaxed ${isActive ? 'text-gray-700' : 'text-gray-600'}`}>
                          {entry.zh}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-5 bg-gray-200 rounded w-full mb-1.5" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </>
                    )}
                  </>
                ) : mode === '中文' ? (
                  <div className={`text-sm leading-relaxed ${isActive ? 'text-gray-700' : 'text-gray-600'}`}>
                    {entry.zh}
                  </div>
                ) : mode === '韩文' ? (
                  <div className={`text-lg font-bold leading-relaxed tracking-wider ${isActive ? 'text-gray-900' : 'text-gray-800'}`} style={{ wordSpacing: '0.15em' }}>
                    {entry.ko}
                  </div>
                ) : (
                  // 双语模式：韩语加粗 + 中文字号缩小一号
                  <>
                    <div className={`text-lg font-extrabold leading-relaxed tracking-wider mb-0.5 ${isActive ? 'text-gray-900' : 'text-gray-800'}`} style={{ wordSpacing: '0.15em' }}>
                      {entry.ko}
                    </div>
                    <div className={`text-sm leading-relaxed ${isActive ? 'text-gray-700' : 'text-gray-600'}`}>
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
