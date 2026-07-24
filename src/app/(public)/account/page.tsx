'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

const avatars = [
  '/avatars/avatar-1.svg',
  '/avatars/avatar-2.svg',
  '/avatars/avatar-3.svg',
  '/avatars/avatar-4.svg',
  '/avatars/avatar-5.svg',
  '/avatars/avatar-6.svg',
  '/avatars/avatar-7.svg',
  '/avatars/avatar-8.svg',
]

function getAvatar(email?: string | null) {
  if (!email) return avatars[0]
  const idx = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avatars.length
  return avatars[idx]
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [progressStats, setProgressStats] = useState({ totalVideos: 0, learnedVideos: 0, unlearnedVideos: 0 })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginModalMsg, setLoginModalMsg] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackType, setFeedbackType] = useState('问题反馈')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [feedbackContact, setFeedbackContact] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [qrModal, setQrModal] = useState<{open: boolean, type: 'wechat' | 'xiaohongshu' | 'douyin' | null}>({open: false, type: null})

  useEffect(() => {
    fetch('/api/user/progress/stats')
      .then(res => res.json())
      .then(data => {
        if (data.totalVideos !== undefined) setProgressStats(data)
      })
      .catch(console.error)
  }, [])

  const isLoggedIn = status === 'authenticated'
  const avatarUrl = getAvatar(session?.user?.email)

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) return
    setFeedbackSubmitting(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: feedbackType, content: feedbackContent, contact: feedbackContact }),
      })
      setFeedbackDone(true)
    } catch {
      alert('提交失败')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword !== confirmPassword) { setError('两次密码不一致'); return }
    if (newPassword.length < 6) { setError('密码至少6个字符'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '修改密码失败'); return }
      setSuccess('密码修改成功')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch { setError('发生错误') }
    finally { setLoading(false) }
  }

  const menuItems = [
    { label: '我的收藏', href: '/favorites', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>) },
    { label: '学习方法', href: '/learning-method', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>) },
    { label: '联系客服', href: 'javascript:;', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>), onClick: () => setQrModal({open: true, type: 'wechat'}) },
    { label: '反馈', href: 'javascript:;', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>), onClick: () => { if (!isLoggedIn) { setShowLoginPrompt(true); return }; setShowFeedbackModal(true) } },
    { label: '修改密码', href: 'javascript:;', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>), onClick: () => { if (!isLoggedIn) { setLoginModalMsg('登录后即可修改密码'); return }; setShowPasswordForm(!showPasswordForm) } },
  ]

  // Only show 退出登录 when logged in
  if (isLoggedIn) {
    menuItems.push({ label: '退出登录', href: 'javascript:;', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>), onClick: () => signOut({ callbackUrl: '/login' }) })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 md:pb-8 space-y-4">
      {/* Top Card: Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            {isLoggedIn ? (
              <>
                <p className="text-base font-semibold text-gray-900 dark:text-slate-100 truncate">{session?.user?.email}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">继续加油学习！</p>
              </>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1.5">欢迎来到 ShadowKorean</p>
                <Link href="/login" className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  立即登录
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
          {!isLoggedIn ? (
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 text-center border border-blue-100/30 dark:border-blue-800/30">
                  <div className="w-9 h-9 mx-auto mb-2 bg-blue-100/60 dark:bg-blue-800/40 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-blue-300 dark:text-blue-500">--</div>
                  <div className="text-xs text-blue-400/70 dark:text-blue-400/70 mt-0.5">学习天数</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl p-4 text-center border border-emerald-100/30 dark:border-emerald-800/30">
                  <div className="w-9 h-9 mx-auto mb-2 bg-emerald-100/60 dark:bg-emerald-800/40 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-emerald-300 dark:text-emerald-500">--</div>
                  <div className="text-xs text-emerald-400/70 dark:text-emerald-400/70 mt-0.5">已完成</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-900/30 dark:to-orange-800/20 rounded-xl p-4 text-center border border-amber-100/30 dark:border-amber-800/30">
                  <div className="w-9 h-9 mx-auto mb-2 bg-amber-100/60 dark:bg-amber-800/40 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-amber-300 dark:text-amber-500">--</div>
                  <div className="text-xs text-amber-400/70 dark:text-amber-400/70 mt-0.5">未完成</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/30 dark:bg-slate-800/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-800 dark:text-slate-200 drop-shadow-sm">解锁学习进度</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 drop-shadow-sm">登录即可查看学习统计</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]"></div>
                <div className="relative">
                  <div className="w-9 h-9 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-white">{progressStats.learnedVideos}</div>
                  <div className="text-xs text-blue-100 mt-0.5">学习天数</div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]"></div>
                <div className="relative">
                  <div className="w-9 h-9 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-white">{progressStats.learnedVideos}</div>
                  <div className="text-xs text-emerald-100 mt-0.5">已完成</div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]"></div>
                <div className="relative">
                  <div className="w-9 h-9 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-white">{progressStats.unlearnedVideos}</div>
                  <div className="text-xs text-amber-100 mt-0.5">未完成</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Card: Menu */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm divide-y divide-gray-100 dark:divide-slate-700 overflow-hidden">
        {menuItems.map((item, idx) => (
          item.href.startsWith('http') || item.href.startsWith('/') ? (
            <Link key={idx} href={item.href} className="flex items-center gap-3 px-5 py-3.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <span className="text-gray-400 dark:text-slate-500">{item.icon}</span>
              <span>{item.label}</span>
              <svg className="w-4 h-4 ml-auto text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <button key={idx} onClick={item.onClick} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
              <span className="text-gray-400 dark:text-slate-500">{item.icon}</span>
              <span>{item.label}</span>
              <svg className="w-4 h-4 ml-auto text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )
        ))}
      </div>

      {/* Login/Register buttons for unauthenticated users */}
      {!isLoggedIn && (
        <div className="flex gap-3">
          <Link href="/login" className="flex-1 bg-blue-600 text-white text-center py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium">
            立即登录
          </Link>
          <Link href="/register" className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-center py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 text-sm font-medium">
            注册账号
          </Link>
        </div>
      )}

      {/* Password change form (collapsible) */}
      {showPasswordForm && isLoggedIn && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4">修改密码</h3>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            {error && <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</div>}
            {success && <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded">{success}</div>}
            <input type="password" placeholder="当前密码" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
            <input type="password" placeholder="新密码" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
            <input type="password" placeholder="确认新密码" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 text-sm font-medium">{loading ? '修改中...' : '确认修改'}</button>
          </form>
        </div>
      )}

      {/* Login Modal */}
      {loginModalMsg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setLoginModalMsg('')}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-bold mb-3 dark:text-slate-100">需要登录</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">{loginModalMsg}</p>
            <Link href="/login" className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg hover:bg-blue-700 font-medium mb-2">立即登录</Link>
            <Link href="/register" className="block w-full text-gray-500 dark:text-slate-400 text-sm text-center py-2 rounded-lg hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700">注册账号</Link>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {
            setShowFeedbackModal(false)
            setFeedbackDone(false)
          }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {feedbackDone ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold mb-2 dark:text-slate-100">感谢您的反馈！</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                  我们会认真阅读每一条意见
                </p>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false)
                    setFeedbackDone(false)
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  关闭
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2 dark:text-slate-100">意见反馈</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                  您的反馈对我们非常重要，帮助我们不断改进
                </p>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                    反馈类型
                  </label>
                  <div className="flex gap-2">
                    {['问题反馈', '功能建议', '其他'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFeedbackType(t)}
                        className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${feedbackType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:border-blue-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                    反馈内容 *
                  </label>
                  <textarea
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="请详细描述您的问题或建议..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                    联系方式{' '}
                    <span className="text-gray-400 dark:text-slate-500 font-normal">
                      （选填）
                    </span>
                  </label>
                  <input
                    value={feedbackContact}
                    onChange={(e) => setFeedbackContact(e.target.value)}
                    placeholder="邮箱或手机号，方便我们与您联系"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <button
                  onClick={handleSubmitFeedback}
                  disabled={feedbackSubmitting || !feedbackContent.trim()}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {feedbackSubmitting ? '提交中...' : '提交反馈'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-bold mb-3 dark:text-slate-100">需要登录</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
              登录后即可提交反馈
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

      {/* QR Code Modal */}
      {qrModal.open && qrModal.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrModal({open: false, type: null})}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setQrModal({open: false, type: null})}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                {qrModal.type === 'wechat' && '微信扫码'}
                {qrModal.type === 'xiaohongshu' && '小红书扫码'}
                {qrModal.type === 'douyin' && '抖音扫码'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">扫码添加客服，获取更多帮助</p>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-8 mb-4">
                <div className="w-48 h-48 mx-auto bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <Image
                    src={`/qr-${qrModal.type}.png`}
                    alt={`${qrModal.type} QR Code`}
                    width={192}
                    height={192}
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500">请使用{qrModal.type === 'wechat' ? '微信' : qrModal.type === 'xiaohongshu' ? '小红书' : '抖音'}扫描二维码</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
