import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DevSecOpsBoard } from '@/components/dashboard/devsecops-board'

export default function Home() {
  return (
    <DashboardLayout>
      <DevSecOpsBoard />
    </DashboardLayout>
  )
}
