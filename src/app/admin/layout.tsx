import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AntdProvider } from '@/components/providers/AntdProvider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <Link href="/admin" className="text-2xl font-bold text-blue-600">
              管理后台
            </Link>
          </div>
          <nav className="px-4 space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              仪表盘
            </Link>
            <Link
              href="/admin/videos"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              视频管理
            </Link>
            <Link
              href="/admin/categories"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              分类管理
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              用户管理
            </Link>
            <Link
              href="/admin/settings"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              系统设置
            </Link>
          </nav>
          <div className="px-4 mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              ← 返回前台
            </Link>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <AntdProvider>{children}</AntdProvider>
        </main>
      </div>
    </div>
  )
}
