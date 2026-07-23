'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [qrModal, setQrModal] = useState<{open: boolean, type: 'wechat' | 'xiaohongshu' | 'douyin' | null}>({open: false, type: null})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('邮箱或密码错误')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('发生错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-16 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-12 w-56 h-56 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top - Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Shadow Korean</h1>
            </div>
            <p className="text-blue-200 text-base ml-[52px]">语库｜真实语料</p>
          </div>

          {/* Middle - Main Card */}
          <div className="flex-1 flex items-center py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md border border-white/20">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">通过真实语料学习韩语</h2>
                  <p className="text-blue-100 text-sm leading-relaxed mt-3">
                    通过跟读、听写、填空等多种学习模式，提供沉浸式学习体验。让韩语学习更加高效、有趣。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom - Highlights */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl py-4 px-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">5+</div>
              <div className="text-blue-200 text-xs mt-1">学习模式</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl py-4 px-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-blue-200 text-xs mt-1">精选视频</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl py-4 px-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">AI</div>
              <div className="text-blue-200 text-xs mt-1">智能学习</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[55%] bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1.5">Shadow Korean</h2>
            <p className="text-gray-500 text-sm">欢迎回来，请登录您的账号</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">登录</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  账号
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="请输入手机号或邮箱"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                  />
                </div>
                <div className="mt-2 text-right">
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
                    忘记密码?
                  </Link>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                >
                  {loading ? '登录中...' : '登录'}
                </button>

                <Link href="/register" className="block">
                  <button
                    type="button"
                    className="w-full bg-gray-50 text-gray-600 py-2.5 px-4 rounded-xl hover:bg-gray-100 font-medium transition-colors border border-gray-200 text-sm"
                  >
                    立即注册
                  </button>
                </Link>
              </div>
            </form>
          </div>

          {/* Contact Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">联系我们</h4>
            <div className="flex items-center justify-center gap-5 mb-4">
              <button type="button" onClick={() => setQrModal({open: true, type: 'wechat'})} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.11.24-.245 0-.06-.024-.12-.04-.178l-.325-1.233a.492.492 0 01.177-.554C23.028 18.473 24 16.82 24 14.941c0-3.28-3.04-5.95-7.062-6.083zm-2.089 2.9c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
                </svg>
                <span>微信</span>
              </button>
              <button type="button" onClick={() => setQrModal({open: true, type: 'xiaohongshu'})} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5h-9v-1h9v1zm0-3h-9v-1h9v1zm0-3h-9v-1h9v1zm0-3h-9v-1h9v1z"/>
                </svg>
                <span>小红书</span>
              </button>
              <button type="button" onClick={() => setQrModal({open: true, type: 'douyin'})} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3 15c-1.105 0-2-.672-2-1.5S13.895 14 15 14s2 .672 2 1.5-.895 1.5-2 1.5zm-6 0c-1.105 0-2-.672-2-1.5S7.895 14 9 14s2 .672 2 1.5S10.105 17 9 17zm3-5a3 3 0 110-6 3 3 0 010 6z"/>
                </svg>
                <span>抖音</span>
              </button>
            </div>
            <p className="text-xs text-gray-400">
              继续使用即表示您同意我们的
              <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">服务条款</a>
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModal.open && qrModal.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrModal({open: false, type: null})}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setQrModal({open: false, type: null})}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {qrModal.type === 'wechat' && '微信扫码'}
                {qrModal.type === 'xiaohongshu' && '小红书扫码'}
                {qrModal.type === 'douyin' && '抖音扫码'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">扫码添加客服，获取更多帮助</p>
              <div className="bg-gray-50 rounded-xl p-8 mb-4">
                <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center">
                  <Image
                    src={`/qr-${qrModal.type}.png`}
                    alt={`${qrModal.type} QR Code`}
                    width={192}
                    height={192}
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">请使用{qrModal.type === 'wechat' ? '微信' : qrModal.type === 'xiaohongshu' ? '小红书' : '抖音'}扫描二维码</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
