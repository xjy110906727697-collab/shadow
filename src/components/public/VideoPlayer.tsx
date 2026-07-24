'use client'

import { useRef, useState, useEffect } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  videoUrl: string
  onTimeUpdate?: (currentTime: number) => void
}

export function VideoPlayer({ videoUrl, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const isHls = videoUrl.includes('.m3u8')

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hlsRef.current = hls
        hls.loadSource(videoUrl)
        hls.attachMedia(video)
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl
      }
    } else {
      video.src = videoUrl
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)
    }

    const handleLoadedMetadata = () => { setDuration(video.duration) }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [videoUrl, onTimeUpdate])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) video.pause(); else video.play()
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackRate(speed)
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) video.requestFullscreen()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div>
      {/* Video */}
      <div className="bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          onClick={togglePlay}
          autoPlay
        />
      </div>

      {/* Controls below video */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-b-lg px-4 py-3 space-y-3">
        {/* Progress bar — filled left, empty right */}
        <div className="relative h-2 bg-gray-200 dark:bg-slate-600 rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            const video = videoRef.current
            if (video) {
              const time = pct * (duration || 0)
              video.currentTime = time
              setCurrentTime(time)
            }
          }}
        >
          <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full pointer-events-none" style={{ width: `${progress}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow pointer-events-none" style={{ left: `${progress}%`, marginLeft: '-8px' }} />
        </div>

        {/* Buttons row — larger on desktop */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={togglePlay} className="text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1">
              {isPlaying ? (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <span className="text-xs md:text-sm text-gray-500 dark:text-slate-400 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-1 md:gap-1.5">
              {[0.5, 0.8, 1, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded transition-colors ${
                    playbackRate === speed
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button onClick={handleFullscreen} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
