'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface WordData {
  id: string
  word: string
  meaning: string
  meaningZh: string
  videoId: string
  videoTitle?: string
}

interface WordPopupProps {
  word: WordData | null
  onClose: () => void
}

export function WordPopup({ word, onClose }: WordPopupProps) {
  const { data: session } = useSession()
  const [isInBag, setIsInBag] = useState(false)
  const [adding, setAdding] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    if (!word || !session) {
      setIsInBag(false)
      return
    }

    fetch('/api/word-bag')
      .then(res => res.json())
      .then(data => {
        const wordIds: string[] = data.words || []
        setIsInBag(wordIds.includes(word.id))
      })
      .catch(() => setIsInBag(false))
  }, [word, session])

  if (!word) return null

  const handleAddToBag = async () => {
    if (!session) {
      setShowLoginPrompt(true)
      return
    }

    setAdding(true)
    try {
      const res = await fetch('/api/word-bag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: word.id }),
      })
      const data = await res.json()
      setIsInBag(data.added)
    } catch (error) {
      console.error('Failed to add to word bag:', error)
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{word.word}</h2>
              {word.videoTitle && (
                <Link
                  href={`/video/${word.videoId}`}
                  className="text-sm text-blue-600 hover:underline"
                  onClick={onClose}
                >
                  来自：{word.videoTitle}
                </Link>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">韩语释义</div>
              <div className="text-base text-gray-800">{word.meaning}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">中文翻译</div>
              <div className="text-base text-gray-800">{word.meaningZh}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isInBag ? (
              <button
                onClick={handleAddToBag}
                disabled={adding}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
              >
                {adding ? '加入中...' : '加入词卡'}
              </button>
            ) : (
              <div className="flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-lg text-center text-sm">
                已在词卡中
              </div>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 text-sm"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-bold mb-3">需要登录</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              登录后即可加入词卡
            </p>
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg hover:bg-blue-700 font-medium mb-2"
            >
              立即登录
            </Link>
            <Link
              href="/register"
              className="block w-full text-gray-500 text-sm text-center py-2 rounded-lg hover:text-gray-700 hover:bg-gray-50"
            >
              注册账号
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
