'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

interface SubtitleEntry {
  id: string
  index: number
  startTime: number
  endTime: number
  ko: string
  zh: string
}

interface VideoWord {
  id: string
  word: string
  meaning: string
  meaningZh: string
  videoId: string
}

interface SubtitlePanelProps {
  subtitles: SubtitleEntry[]
  currentTime: number
  onSeek?: (time: number) => void
  mode?: '双语' | '韩文' | '中文' | '盲听' | '词卡'
  onModeChange?: (mode: '双语' | '韩文' | '中文' | '盲听' | '词卡') => void
  isFavorited?: boolean
  onFavoriteToggle?: () => void
  words?: VideoWord[]
  onWordClick?: (word: VideoWord) => void
}

const subtitleModes = ['双语', '韩文', '中文', '盲听', '词卡'] as const

function HighlightedText({ text, words, onWordClick, isActive }: {
  text: string
  words: VideoWord[]
  onWordClick?: (word: VideoWord) => void
  isActive: boolean
}) {
  if (!words || words.length === 0 || !text) {
    return <>{text}</>
  }

  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length)
  const parts: { text: string; word?: VideoWord }[] = []
  let remaining = text
  const usedRanges: { start: number; end: number }[] = []

  for (const w of sortedWords) {
    let searchFrom = 0
    while (true) {
      const idx = remaining.indexOf(w.word, searchFrom)
      if (idx === -1) break

      const overlaps = usedRanges.some(r =>
        (idx >= r.start && idx < r.end) || (idx + w.word.length > r.start && idx + w.word.length <= r.end)
      )
      if (!overlaps) {
        parts.push({ text: w.word, word: w })
        usedRanges.push({ start: idx, end: idx + w.word.length })
      }
      searchFrom = idx + w.word.length
    }
  }

  if (parts.length === 0) {
    return <>{text}</>
  }

  const allParts: { text: string; word?: VideoWord }[] = []
  let lastEnd = 0
  const sortedParts = [...parts].sort((a, b) => {
    const aIdx = text.indexOf(a.text)
    const bIdx = text.indexOf(b.text)
    return aIdx - bIdx
  })

  for (const part of sortedParts) {
    const idx = text.indexOf(part.text, lastEnd)
    if (idx === -1) continue
    if (idx > lastEnd) {
      allParts.push({ text: text.slice(lastEnd, idx) })
    }
    allParts.push(part)
    lastEnd = idx + part.text.length
  }
  if (lastEnd < text.length) {
    allParts.push({ text: text.slice(lastEnd) })
  }

  return (
    <>
      {allParts.map((part, i) => {
        if (part.word) {
          return (
            <span
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                onWordClick?.(part.word!)
              }}
              className={`cursor-pointer border-b-2 border-dashed transition-colors ${
                isActive
                  ? 'border-blue-400 text-blue-700 hover:text-blue-900'
                  : 'border-blue-300 text-blue-600 hover:text-blue-800'
              }`}
            >
              {part.text}
            </span>
          )
        }
        return <span key={i}>{part.text}</span>
      })}
    </>
  )
}

export function SubtitlePanel({
  subtitles,
  currentTime,
  onSeek,
  mode = '双语',
  onModeChange,
  isFavorited,
  onFavoriteToggle,
  words = [],
  onWordClick,
}: SubtitlePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)
  const [blindRevealed, setBlindRevealed] = useState<Set<string>>(new Set())
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const isWordCards = mode === "词卡"

  const toggleBlind = (id: string) => {
    setBlindRevealed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // 离开词卡模式时重置选中
  useEffect(() => {
    if (!isWordCards) setSelectedWordId(null)
  }, [isWordCards])

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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-3 py-2.5 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 bg-gray-200/80 dark:bg-slate-600/80 rounded-lg p-0.5 gap-0.5">
            {subtitleModes.map(m => (
              <button
                key={m}
                onClick={() => onModeChange?.(m)}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all text-center font-medium ${
                  mode === m
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                {m === '词卡' && words.length > 0 ? `词卡(${words.length})` : m}
              </button>
            ))}
          </div>

          {onFavoriteToggle && (
            <button
              onClick={onFavoriteToggle}
              className={`flex-shrink-0 w-9 h-9 flex items-center justify-center transition-all ${
                isFavorited
                  ? 'text-red-500'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-500 hover:text-red-400'
              }`}
            >
              <svg className="w-4.5 h-4.5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isWordCards ? (
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧：词卡列表 */}
          <div className="w-[25%] overflow-y-auto border-r border-gray-200 dark:border-slate-700 p-2 space-y-1.5">
            {!words || words.length === 0 ? (
              <p className="text-gray-400 dark:text-slate-500 text-center py-8 text-sm">该视频暂无词卡</p>
            ) : (
              words.map(w => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWordId(w.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all ${
                    selectedWordId === w.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm'
                      : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-transparent'
                  }`}
                >
                  <div className="font-bold text-gray-900 dark:text-slate-100 text-sm mb-0.5">{w.word}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{w.meaningZh}</div>
                </button>
              ))
            )}
          </div>

          {/* 右侧：词卡详情 */}
          <div className="flex-1 overflow-y-auto p-4">
            {(() => {
              const selected = words.find(w => w.id === selectedWordId)
              if (!selected) {
                return (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500 text-sm">
                    点击左侧词卡查看详情
                  </div>
                )
              }
              return (
                <div className="space-y-4">
                  {selected.meaning && (
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 leading-relaxed">
                      <ReactMarkdown>{selected.meaning}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="overflow-y-auto flex-1 p-3 space-y-2"
        >
          {!subtitles || subtitles.length === 0 ? (
            <p className="text-gray-400 dark:text-slate-500 text-center py-8 text-sm">暂无字幕</p>
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
                      ? 'bg-gradient-to-b from-blue-50/90 via-blue-50/60 to-blue-50/90 dark:from-blue-900/40 dark:via-blue-900/30 dark:to-blue-900/40 border border-blue-300/60 dark:border-blue-700/60 shadow-sm'
                      : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-transparent'
                  }`}
                >
                  {isActive ? (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
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
                      <span className="text-[11px] text-blue-500 dark:text-blue-400 font-medium">正在播放</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-400 dark:text-slate-500 font-mono mb-1.5">{formatTime(entry.startTime)}</div>
                  )}

                  {mode === '盲听' ? (
                    <>
                      {blindRevealed.has(entry.id) ? (
                        <>
                          <div className={`text-base font-extrabold leading-relaxed tracking-wider mb-1 ${isActive ? 'text-gray-900 dark:text-slate-100' : 'text-gray-800 dark:text-slate-200'}`} style={{ wordSpacing: '0.15em' }}>
                            <HighlightedText text={entry.ko} words={words} onWordClick={onWordClick} isActive={isActive} />
                          </div>
                          <div className={`text-sm leading-relaxed ${isActive ? 'text-gray-700 dark:text-slate-300' : 'text-gray-600 dark:text-slate-400'}`}>
                            {entry.zh}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-5 bg-gray-200 dark:bg-slate-600 rounded w-full mb-1.5" />
                          <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4" />
                        </>
                      )}
                    </>
                  ) : mode === '中文' ? (
                    <div className={`text-sm leading-relaxed ${isActive ? 'text-gray-700 dark:text-slate-300' : 'text-gray-600 dark:text-slate-400'}`}>
                      {entry.zh}
                    </div>
                  ) : mode === '韩文' ? (
                    <div className={`text-lg font-bold leading-relaxed tracking-wider ${isActive ? 'text-gray-900 dark:text-slate-100' : 'text-gray-800 dark:text-slate-200'}`} style={{ wordSpacing: '0.15em' }}>
                      <HighlightedText text={entry.ko} words={words} onWordClick={onWordClick} isActive={isActive} />
                    </div>
                  ) : (
                    <>
                      <div className={`text-lg font-extrabold leading-relaxed tracking-wider mb-0.5 ${isActive ? 'text-gray-900 dark:text-slate-100' : 'text-gray-800 dark:text-slate-200'}`} style={{ wordSpacing: '0.15em' }}>
                        <HighlightedText text={entry.ko} words={words} onWordClick={onWordClick} isActive={isActive} />
                      </div>
                      <div className={`text-sm leading-relaxed ${isActive ? 'text-gray-700 dark:text-slate-300' : 'text-gray-600 dark:text-slate-400'}`}>
                        {entry.zh}
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
