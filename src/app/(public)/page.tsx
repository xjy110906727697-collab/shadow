'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { VideoCard } from '@/components/public/VideoCard'
import { SearchBar } from '@/components/public/SearchBar'
import { FilterDrawer } from '@/components/layout/FilterDrawer'

interface Category {
  id: string
  name: string
  nameZh: string
  slug: string
  type: 'LEVEL' | 'TOPIC'
}

interface TopicInfo {
  id: string
  name: string
  slug: string
}

interface Video {
  id: string
  title: string
  titleZh: string
  description?: string | null
  descriptionZh?: string | null
  coverUrl: string
  duration: number
  episodeNumber?: number | null
  difficulty?: number | null
  instructor?: string | null
  level?: string | null
  topics?: TopicInfo[]
  visitorAccessible?: boolean
  createdAt?: string
}

interface ProgressStats {
  totalVideos: number
  learnedVideos: number
  unlearnedVideos: number
}

type DurationFilter = '' | 'lt3' | '3to5' | 'gt5'

function BrowsePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get('search') || ''
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '')
  // Draft state — changes as user interacts with filters
  const [durationDraft, setDurationDraft] = useState<DurationFilter>('')
  const [difficultyDraft, setDifficultyDraft] = useState(0)
  const [instructorDraft, setInstructorDraft] = useState('')
  const [topicDraft, setTopicDraft] = useState(searchParams.get('topic') || '')
  // Applied state — only updated when "视频筛选" button is clicked
  const [appliedDuration, setAppliedDuration] = useState<DurationFilter>('')
  const [appliedDifficulty, setAppliedDifficulty] = useState(0)
  const [appliedInstructor, setAppliedInstructor] = useState('')
  const [appliedTopic, setAppliedTopic] = useState(searchParams.get('topic') || '')
  const [instructors, setInstructors] = useState<string[]>([])
  const [progressStats, setProgressStats] = useState<ProgressStats>({ totalVideos: 0, learnedVideos: 0, unlearnedVideos: 0 })
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [activeStat, setActiveStat] = useState<'all' | 'learned' | 'unlearned'>('all')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  const isVisitor = !session

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetch('/api/user/progress/stats')
      .then(res => res.json())
      .then(data => {
        if (data.totalVideos !== undefined) {
          setProgressStats(data)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    const handleVideoLocked = () => setShowSubscribeModal(true)
    const handleFavoriteLogin = () => setShowLoginPrompt(true)
    const handleOpenFilter = () => setFilterDrawerOpen(true)
    const handleToggleSearch = () => setShowMobileSearch(prev => !prev)
    window.addEventListener('video-locked', handleVideoLocked)
    window.addEventListener('favorite-login', handleFavoriteLogin)
    window.addEventListener('open-filter-drawer', handleOpenFilter)
    window.addEventListener('toggle-mobile-search', handleToggleSearch)
    return () => {
      window.removeEventListener('video-locked', handleVideoLocked)
      window.removeEventListener('favorite-login', handleFavoriteLogin)
      window.removeEventListener('open-filter-drawer', handleOpenFilter)
      window.removeEventListener('toggle-mobile-search', handleToggleSearch)
    }
  }, [])

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      setPage(1)
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.set('search', searchQuery)
        if (appliedTopic) params.set('topic', appliedTopic)
        if (appliedDuration) params.set('duration', appliedDuration)
        if (appliedDifficulty > 0) params.set('difficulty', appliedDifficulty.toString())
        if (appliedInstructor) params.set('instructor', appliedInstructor)
        if (activeStat !== 'all') params.set('progress', activeStat)
        params.set('page', '1')
        const res = await fetch(`/api/videos?${params.toString()}`)
        const data = await res.json()
        const fetchedVideos = data.videos

        setVideos(fetchedVideos)

        // Collect unique instructors from all videos
        const uniqueInstructors = [...new Set<string>(
          (data.videos as Video[]).map((v: Video) => v.instructor).filter(Boolean) as string[]
        )].sort()
        setInstructors(uniqueInstructors)

        setTotalPages(data.pagination.totalPages)
      } catch (error) {
        console.error('Failed to fetch videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [searchQuery, appliedTopic, appliedDuration, appliedDifficulty, appliedInstructor, activeStat])

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return
    
    setLoadingMore(true)
    const nextPage = page + 1
    
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (appliedTopic) params.set('topic', appliedTopic)
      if (appliedDuration) params.set('duration', appliedDuration)
      if (appliedDifficulty > 0) params.set('difficulty', appliedDifficulty.toString())
      if (appliedInstructor) params.set('instructor', appliedInstructor)
      if (activeStat !== 'all') params.set('progress', activeStat)
      params.set('page', nextPage.toString())
      const res = await fetch(`/api/videos?${params.toString()}`)
      const data = await res.json()
      setVideos(prev => [...prev, ...data.videos])
      setPage(nextPage)
    } catch (error) {
      console.error('Failed to load more videos:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, loadingMore, page, totalPages])

  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [mobileSearchText, setMobileSearchText] = useState(searchQuery)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Debounced mobile search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mobileSearchText !== searchQuery) {
        const params = new URLSearchParams(searchParams)
        if (mobileSearchText) params.set('search', mobileSearchText)
        else params.delete('search')
        params.set('page', '1')
        router.push(`?${params.toString()}`)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [mobileSearchText])

  const topics = categories.filter(c => c.type === 'TOPIC')

  const toggleTopic = (slug: string) => {
    setTopicDraft(prev => prev === slug ? '' : slug)
  }

  const handleApplyFilters = () => {
    setAppliedDuration(durationDraft)
    setAppliedDifficulty(difficultyDraft)
    setAppliedInstructor(instructorDraft)
    setAppliedTopic(topicDraft)
    setSelectedTopic(topicDraft)
  }

  const statsCards = [
    { label: '总期数', value: progressStats.totalVideos, activeBg: 'bg-blue-50/60', activeText: 'text-blue-700', activeBorder: 'border-blue-500', valueColor: 'text-blue-600', key: 'all' as const },
    { label: '已学习', value: progressStats.learnedVideos, activeBg: 'bg-emerald-50/60', activeText: 'text-emerald-700', activeBorder: 'border-emerald-500', valueColor: 'text-emerald-600', key: 'learned' as const },
    { label: '未学习', value: progressStats.unlearnedVideos, activeBg: 'bg-amber-50/60', activeText: 'text-amber-700', activeBorder: 'border-amber-500', valueColor: 'text-amber-600', key: 'unlearned' as const },
  ]

  const handleStatClick = (key: 'all' | 'learned' | 'unlearned') => {
    if (activeStat === key) return
    // If not logged in and clicking learned/unlearned, show login prompt
    if (isVisitor && key !== 'all') {
      setShowLoginPrompt(true)
      return
    }
    setActiveStat(key)
  }

  const sidebarContent = (
    <>
      <SearchBar />

      {/* Combined Stats Card - clickable rows */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
        {statsCards.map((card, idx) => {
          const isActive = activeStat === card.key
          return (
            <button
              key={card.key}
              onClick={() => handleStatClick(card.key)}
              className={`w-full flex items-center justify-between px-4 py-3.5 transition-all duration-200 cursor-pointer border-l-[3px] ${
                idx < statsCards.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''
              } ${
                isActive
                  ? `${card.activeBg} ${card.activeBorder} ${card.activeText}`
                  : 'border-l-transparent text-gray-500 dark:text-slate-400 hover:bg-gray-50/70 dark:hover:bg-slate-700/50 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {card.key === 'all' && (
                  <svg className={`w-[18px] h-[18px] ${isActive ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )}
                {card.key === 'learned' && (
                  <svg className={`w-[18px] h-[18px] ${isActive ? 'text-emerald-500' : 'text-gray-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {card.key === 'unlearned' && (
                  <svg className={`w-[18px] h-[18px] ${isActive ? 'text-amber-500' : 'text-gray-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="text-sm font-medium">
                  {card.label}
                </span>
              </div>
              <span className={`text-xl font-semibold tabular-nums ${isActive ? card.valueColor : 'text-gray-400 dark:text-slate-500'}`}>
                {card.value}
              </span>
            </button>
          )
        })}
      </div>

      {/* Combined Filters Card - bigger */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-700 pb-2">筛选条件</h3>

        {/* 时长 + 频道 on one row — aligned */}
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <h4 className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">时长</h4>
            <select
              value={durationDraft}
              onChange={e => setDurationDraft(e.target.value as DurationFilter)}
              className="w-full text-sm border border-gray-200 dark:border-slate-600 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="">全部</option>
              <option value="lt3">&lt; 3分钟</option>
              <option value="3to5">3-5分钟</option>
              <option value="gt5">&gt; 5分钟</option>
            </select>
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">频道</h4>
            <select
              value={instructorDraft}
              onChange={e => setInstructorDraft(e.target.value)}
              className="w-full text-sm border border-gray-200 dark:border-slate-600 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="">全部</option>
              {instructors.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 难度单独一行 */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">难度</h4>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setDifficultyDraft(difficultyDraft === star ? 0 : star)}
                className={`text-lg px-0.5 leading-none transition-colors cursor-pointer ${
                  star <= difficultyDraft ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600 hover:text-yellow-300'
                }`}
                title={`${star}星`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* 主题标签 as toggle chips */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">主题标签</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.slug)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  topicDraft === topic.slug
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {topic.nameZh}
              </button>
            ))}
          </div>
        </div>

        {/* 视频筛选 button */}
        <button
          onClick={() => {
            handleApplyFilters()
            setFilterDrawerOpen(false)
          }}
          className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          视频筛选
        </button>
      </div>
    </>
  )

  return (
    <div className="w-full px-4 md:px-6 py-3 pb-20 md:pb-3">
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-bold mb-3 dark:text-slate-100">需要登录</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
              登录后即可查看学习进度和筛选内容
            </p>
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg hover:bg-blue-700 font-medium mb-2"
            >
              立即登录
            </Link>
            <Link
              href="/register"
              className="block w-full text-gray-500 dark:text-slate-400 text-sm text-center py-2 rounded-lg hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              注册账号
            </Link>
          </div>
        </div>
      )}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSubscribeModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3 dark:text-slate-100">此内容需要登录</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
              游客模式仅可观看第1、2、3期视频<br />
              注册账号后即可解锁全部内容
            </p>
            <Link
              href="/register"
              className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg hover:bg-blue-700 font-medium mb-2"
            >
              立即注册
            </Link>
            <Link
              href="/login"
              className="block w-full text-gray-500 dark:text-slate-400 text-sm text-center py-2 rounded-lg hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              已有账号？去登录
            </Link>
          </div>
        </div>
      )}

      {/* Mobile search input */}
      {showMobileSearch && (
        <div className="md:hidden mb-3">
            <input
            type="text"
            value={mobileSearchText}
            onChange={e => setMobileSearchText(e.target.value)}
            placeholder="搜索视频..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            autoFocus
          />
        </div>
      )}

      <FilterDrawer open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
        <div className="p-4 space-y-3">
          {sidebarContent}
        </div>
      </FilterDrawer>
      
      <div className="flex flex-row gap-4">
        <aside className="hidden md:block w-56 md:w-80 shrink-0 space-y-3">
          {sidebarContent}
        </aside>

        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-slate-400 text-sm">加载视频中...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-slate-400 text-sm">暂无视频</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {videos.map(video => (
                  <VideoCard
                    key={video.id}
                    {...video}
                    isVisitor={isVisitor}
                  />
                ))}
              </div>
              
              <div ref={observerRef} className="py-6 text-center">
                {loadingMore && (
                  <p className="text-gray-500 dark:text-slate-400 text-sm">加载更多...</p>
                )}
                {!loadingMore && page < totalPages && (
                  <p className="text-gray-400 dark:text-slate-500 text-xs">向下滚动加载更多</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default function BrowsePageWrapper() {
  return (
    <Suspense fallback={<div className="w-full px-4 md:px-6 py-3"><p className="text-gray-500 dark:text-slate-400 text-sm">加载中...</p></div>}>
      <BrowsePageContent />
    </Suspense>
  )
}
