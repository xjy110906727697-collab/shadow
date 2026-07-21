import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomTabBar } from '@/components/layout/BottomTabBar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomTabBar />
    </div>
  )
}
