import { prisma } from '@/lib/prisma'

export default async function PricingPage() {
  const qrCodeSetting = await prisma.siteSetting.findUnique({
    where: { key: 'wechat-qrcode' }
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">订阅价格</h1>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">订阅方案</h2>
        <p className="text-gray-600 mb-8">
          扫描下方二维码，订阅后即可观看全部视频内容。
        </p>

        {qrCodeSetting?.value ? (
          <div className="mb-8">
            <img
              src={qrCodeSetting.value}
              alt="微信二维码"
              className="max-w-sm mx-auto rounded-lg shadow"
            />
          </div>
        ) : (
          <div className="mb-8 p-8 bg-gray-100 rounded-lg">
            <p className="text-gray-500">二维码暂未开放</p>
          </div>
        )}

        <div className="text-left space-y-4">
          <h3 className="text-xl font-semibold">订阅流程：</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>使用微信扫描下方二维码</li>
            <li>向账户转账付款</li>
            <li>将付款截图发送给我们</li>
            <li>我们将在24小时内激活您的账号</li>
          </ol>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <p className="text-blue-900">
            <strong>需要帮助？</strong>扫描二维码后通过微信联系我们。
          </p>
        </div>
      </div>
    </div>
  )
}
