import { prisma } from '@/lib/prisma'

export default async function AdminDashboardPage() {
  const [videoCount, userCount, activeUserCount, expiringSoonCount] = await Promise.all([
    prisma.video.count(),
    prisma.user.count(),
    prisma.user.count({
      where: {
        OR: [
          { expireAt: null },
          { expireAt: { gt: new Date() } }
        ]
      }
    }),
    prisma.user.count({
      where: {
        expireAt: {
          gt: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      email: true,
      role: true,
      expireAt: true,
      createdAt: true
    }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">仪表盘</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">视频总数</div>
          <div className="text-3xl font-bold text-blue-600">{videoCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">用户总数</div>
          <div className="text-3xl font-bold text-blue-600">{userCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">活跃用户</div>
          <div className="text-3xl font-bold text-green-600">{activeUserCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">即将到期</div>
          <div className="text-3xl font-bold text-yellow-600">{expiringSoonCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold">最近用户</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">到期时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.expireAt
                      ? new Date(user.expireAt).toLocaleDateString()
                      : '无期限'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
