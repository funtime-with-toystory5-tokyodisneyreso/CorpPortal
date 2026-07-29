import { AttendanceSystem } from '@/components/AttendanceSystem'

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">勤怠管理</h1>
      <AttendanceSystem />
    </div>
  )
}
