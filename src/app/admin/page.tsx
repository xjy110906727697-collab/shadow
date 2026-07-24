import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [videoCount, userCount, activeUserCount, expiringSoonCount] =
    await Promise.all([
      prisma.video.count(),
      prisma.user.count(),
      prisma.user.count({
        where: {
          OR: [{ expireAt: null }, { expireAt: { gt: now } }],
        },
      }),
      prisma.user.count({
        where: {
          expireAt: {
            gt: now,
            lte: sevenDaysLater,
          },
        },
      }),
    ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      email: true,
      role: true,
      expireAt: true,
      createdAt: true,
    },
  });

  const stats = [
    {
      title: "视频总数",
      value: videoCount,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
      textColor: "text-blue-600",
    },
    {
      title: "用户总数",
      value: userCount,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100/50",
      textColor: "text-indigo-600",
    },
    {
      title: "活跃用户",
      value: activeUserCount,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100/50",
      textColor: "text-emerald-600",
    },
    {
      title: "即将到期",
      value: expiringSoonCount,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-100/50",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          仪表盘
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          系统概览与数据统计
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-white shadow-lg mb-4`}
              >
                {stat.icon}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                {stat.title}
              </div>
              <div
                className={`text-4xl font-bold ${stat.textColor} dark:text-opacity-90`}
              >
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#faf8f6] dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  最近用户
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  最新注册的用户列表
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  邮箱
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  到期时间
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  创建时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentUsers.map(
                (user: {
                  id: string;
                  email: string;
                  role: string;
                  expireAt: Date | null;
                  createdAt: Date;
                }) => {
                  const isExpired =
                    user.expireAt && new Date(user.expireAt) < new Date();
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/60"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60"
                          }`}
                        >
                          {user.role === "ADMIN" ? "管理员" : "用户"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.expireAt ? (
                          <span
                            className={`text-sm ${isExpired ? "text-red-600 dark:text-red-400 font-medium" : "text-slate-600 dark:text-slate-400"}`}
                          >
                            {new Date(user.expireAt).toLocaleDateString(
                              "zh-CN",
                            )}
                            {isExpired && (
                              <span className="ml-1.5 text-xs">(已过期)</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400 dark:text-slate-500">
                            无期限
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
