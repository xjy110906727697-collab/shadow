"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [account, setAccount] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("密码至少6个字符");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode, account, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "重置失败");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("发生错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-16 w-72 h-72 bg-[#faf8f6] rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-12 w-56 h-56 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top - Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#faf8f6]/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Shadow Korean
              </h1>
            </div>
            <p className="text-blue-200 text-base ml-[52px]">语库｜真实语料</p>
          </div>

          {/* Middle - Main Card */}
          <div className="flex-1 flex items-center py-12">
            <div className="bg-[#faf8f6]/10 backdrop-blur-md rounded-2xl p-8 max-w-md border border-white/20">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-[#faf8f6]/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    安全找回密码
                  </h2>
                  <p className="text-blue-100 text-sm leading-relaxed mt-3">
                    通过邀请码验证身份，快速重置您的密码，保障账号安全。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom - Highlights */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#faf8f6]/10 backdrop-blur-sm rounded-xl py-4 px-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">5+</div>
              <div className="text-blue-200 text-xs mt-1">学习模式</div>
            </div>
            <div className="bg-[#faf8f6]/10 backdrop-blur-sm rounded-xl py-4 px-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-blue-200 text-xs mt-1">精选视频</div>
            </div>
            <div className="bg-[#faf8f6]/10 backdrop-blur-sm rounded-xl py-4 px-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">AI</div>
              <div className="text-blue-200 text-xs mt-1">智能学习</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-[55%] bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Shadow Korean
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1.5">
              找回密码
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              请输入您注册时使用的邀请码和账号来验证身份
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#faf8f6] dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-7">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  密码重置成功
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                  正在跳转到登录页面...
                </p>
                <Link
                  href="/login"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  立即登录
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="inviteCode"
                    className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
                  >
                    邀请码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg
                        className="w-[18px] h-[18px] text-gray-400 dark:text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <input
                      id="inviteCode"
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      placeholder="请输入您注册时使用的邀请码"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-[#faf8f6] dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="account"
                    className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
                  >
                    账号
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg
                        className="w-[18px] h-[18px] text-gray-400 dark:text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      id="account"
                      type="text"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      required
                      placeholder="请输入注册时使用的手机号或邮箱"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-[#faf8f6] dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">
                    您注册时使用的是邮箱还是手机号？请输入对应的邮箱或手机号
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
                  >
                    新密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg
                        className="w-[18px] h-[18px] text-gray-400 dark:text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="请输入新密码（至少6位）"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-[#faf8f6] dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
                  >
                    确认新密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg
                        className="w-[18px] h-[18px] text-gray-400 dark:text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="请再次输入新密码"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-[#faf8f6] dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                  >
                    {loading ? "重置中..." : "重置密码"}
                  </button>

                  <Link href="/login" className="block">
                    <button
                      type="button"
                      className="w-full bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 py-2.5 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-colors border border-gray-200 dark:border-slate-600 text-sm"
                    >
                      返回登录
                    </button>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
