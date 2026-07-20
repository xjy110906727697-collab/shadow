import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LogoutButton } from './LogoutButton'

export async function Header() {
  const session = await getServerSession(authOptions)

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          HangulStudy
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/browse" className="text-gray-600 hover:text-gray-900">
            浏览
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
            订阅
          </Link>

          {session ? (
            <>
              <Link href="/account" className="text-gray-600 hover:text-gray-900">
                {session.user.email}
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="text-blue-600 hover:text-blue-700">
                  管理
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                登录
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
