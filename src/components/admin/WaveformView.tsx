'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions'

interface SubtitleEntry {
  id: string
  index: number
  startTime: number
  endTime: number
  ko: string
  zh: string
}

interface WaveformViewProps {
  audioUrl: string
  entries: SubtitleEntry[]
  currentTime: number
  selectedEntryId: string | null
  onTimeUpdate: (time: number) => void
  onEntrySelect: (entryId: string) => void
}

export function WaveformView({
  audioUrl,
  entries,
  currentTime,
  selectedEntryId,
  onTimeUpdate,
  onEntrySelect
}: WaveformViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const regionsRef = useRef<RegionsPlugin | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return

    const regions = RegionsPlugin.create()
    regionsRef.current = regions

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#ddd',
      progressColor: '#3b82f6',
      cursorColor: '#1e40af',
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 2,
      height: 100,
      barGap: 1,
      plugins: [regions]
    })

    wavesurferRef.current = ws

    ws.load(audioUrl)

    ws.on('ready', () => {
      setIsReady(true)
    })

    ws.on('timeupdate', (time) => {
      onTimeUpdate(time)
    })

    return () => {
      ws.destroy()
    }
  }, [audioUrl])

  useEffect(() => {
    if (!isReady || !regionsRef.current) return

    regionsRef.current.clearRegions()

    entries.forEach(entry => {
      const region = regionsRef.current.addRegion({
        start: entry.startTime,
        end: entry.endTime,
        color: entry.id === selectedEntryId ? 'rgba(59, 130, 246, 0.3)' : 'rgba(200, 200, 200, 0.3)',
        drag: false,
        resize: false
      })

      region.on('click', () => {
        onEntrySelect(entry.id)
      })
    })
  }, [entries, isReady, selectedEntryId])

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause()
    }
  }

  const handleSeek = (time: number) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setTime(time)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Play/Pause
        </button>
        <div className="text-sm text-gray-600">
          Current time: {currentTime.toFixed(2)}s
        </div>
      </div>
      <div ref={containerRef} className="border border-gray-200 rounded" />
    </div>
  )
}
