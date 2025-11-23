import { DashboardNav } from '@/components/smallComponents/DashboardNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main>{children}</main>
    </div>
  )
}
