import { prisma } from '@/lib/prisma'

export default async function PricingPage() {
  const qrCodeSetting = await prisma.siteSetting.findUnique({
    where: { key: 'wechat-qrcode' }
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Pricing</h1>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
        <p className="text-gray-600 mb-8">
          Scan the WeChat QR code below to subscribe and get access to all video content.
        </p>

        {qrCodeSetting?.value ? (
          <div className="mb-8">
            <img
              src={qrCodeSetting.value}
              alt="WeChat QR Code"
              className="max-w-sm mx-auto rounded-lg shadow"
            />
          </div>
        ) : (
          <div className="mb-8 p-8 bg-gray-100 rounded-lg">
            <p className="text-gray-500">QR code not available yet</p>
          </div>
        )}

        <div className="text-left space-y-4">
          <h3 className="text-xl font-semibold">How to subscribe:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Scan the QR code with WeChat</li>
            <li>Send payment to the account</li>
            <li>Send us a message with your payment screenshot</li>
            <li>We will activate your account within 24 hours</li>
          </ol>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <p className="text-blue-900">
            <strong>Need help?</strong> Contact us via WeChat after scanning the QR code.
          </p>
        </div>
      </div>
    </div>
  )
}
