'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type LogEntry = {
  id: string;
  type: '出勤' | '退勤' | '休憩開始' | '休憩終了';
  time: string; // We'll return just HH:mm for the UI
  timestamp: string; // ISO string
}

export type DailyAttendance = {
  date: string;
  day: string;
  status: string;
  in: string;
  out: string;
  break: string;
  total: string;
}

export async function getTodayAttendanceLogs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get today's start and end in UTC (simplified for demo, ideally we use timezone)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('timestamp', today.toISOString())
    .lt('timestamp', tomorrow.toISOString())
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }

  return data.map((log) => {
    const d = new Date(log.timestamp)
    return {
      id: log.id,
      type: log.type as '出勤' | '退勤' | '休憩開始' | '休憩終了',
      time: d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      timestamp: log.timestamp,
    }
  })
}

export async function insertAttendanceLog(type: '出勤' | '退勤' | '休憩開始' | '休憩終了') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('attendance_logs')
    .insert([{ user_id: user.id, type }])

  if (error) {
    console.error('Error inserting log:', error)
    throw error
  }

  revalidatePath('/')
}

export async function getAttendanceHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Fetch logs for the last 7 days
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('timestamp', sevenDaysAgo.toISOString())
    .lte('timestamp', today.toISOString())
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching history:', error)
    return []
  }

  // Group by date string (YYYY-MM-DD) in local time
  const logsByDate: Record<string, any[]> = {}
  data.forEach((log) => {
    const d = new Date(log.timestamp)
    // format as YYYY-MM-DD
    const dateStr = d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    if (!logsByDate[dateStr]) {
      logsByDate[dateStr] = []
    }
    logsByDate[dateStr].push(log)
  })

  const history = []
  const days = ['日', '月', '火', '水', '木', '金', '土']

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    const dayStr = days[d.getDay()]

    const logs = logsByDate[dateStr] || []
    
    if (logs.length === 0) {
      // No logs for this day
      history.push({
        date: dateStr,
        day: dayStr,
        status: (d.getDay() === 0 || d.getDay() === 6) ? '休日' : '未出勤',
        in: '-',
        out: '-',
        break: '-',
        total: '-'
      })
      continue
    }

    // Calculate times
    let firstIn: Date | null = null
    let lastOut: Date | null = null
    let totalBreakMs = 0
    let currentBreakStart: Date | null = null

    for (const log of logs) {
      const time = new Date(log.timestamp)
      if (log.type === '出勤' && !firstIn) firstIn = time
      if (log.type === '退勤') lastOut = time
      if (log.type === '休憩開始' && !currentBreakStart) currentBreakStart = time
      if (log.type === '休憩終了' && currentBreakStart) {
        totalBreakMs += time.getTime() - currentBreakStart.getTime()
        currentBreakStart = null
      }
    }

    const formatTime = (date: Date | null) => date ? date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '-'
    
    let totalMs = 0
    let totalStr = '-'
    let breakStr = '-'

    if (firstIn && lastOut) {
      totalMs = lastOut.getTime() - firstIn.getTime() - totalBreakMs
      
      const hours = Math.floor(totalMs / (1000 * 60 * 60))
      const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
      totalStr = `${hours}:${minutes.toString().padStart(2, '0')}`
    }

    if (totalBreakMs > 0) {
      const bHours = Math.floor(totalBreakMs / (1000 * 60 * 60))
      const bMinutes = Math.floor((totalBreakMs % (1000 * 60 * 60)) / (1000 * 60))
      breakStr = `${bHours}:${bMinutes.toString().padStart(2, '0')}`
    }

    history.push({
      date: dateStr,
      day: dayStr,
      status: '出勤',
      in: formatTime(firstIn),
      out: formatTime(lastOut),
      break: breakStr,
      total: totalStr
    })
  }

  return history
}
