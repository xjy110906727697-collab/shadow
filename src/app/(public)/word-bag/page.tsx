'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { WordPopup } from '@/components/public/WordPopup'

interface WordBagItem {
  id: string
  word: string
  meaning: string
  meaningZh: string
  videoId: string
  videoTitle: string
  addedAt: string
}

export default function WordBagPage() {
  const { data: session } = useSession()
  const [words, setWords] = useState<WordBagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWord, setSelectedWord] = useState<WordBagItem | null>(null)

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }

    fetch('/api/word-bag')
      .then(res => res.json())
      .then(data => setWords(data.words || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [session])

  return (
    <div className="w-full px-4 md:px-8 py-4 pb-20 md:pb-4">
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : !session ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">需要登录查看词卡</p>
          <p className="text-gray-400 mb-6">登录后即可管理和复习您的词卡</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            去登录
          </Link>
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">还没有收藏的单词</p>
          <p className="text-gray-400 mb-6">在视频学习时点击单词，即可加入词卡</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            去浏览视频
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {words.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setSelectedWord(item)}
                    className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors text-left"
                  >
                    {item.word}
                  </button>
                  <div className="text-sm text-gray-600 mt-1">{item.meaning}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{item.meaningZh}</div>
                  <Link
                    href={`/video/${item.videoId}`}
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    来自：{item.videoTitle}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedWord && (
        <WordPopup
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  )
}
