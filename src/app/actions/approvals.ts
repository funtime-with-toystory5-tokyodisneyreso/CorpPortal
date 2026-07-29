'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getApprovals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('approvals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching approvals:', error)
    return []
  }

  return data
}

export async function insertApproval(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const amount = formData.get('amount') as string
  const priority = formData.get('priority') as string
  const approver_route = formData.get('approver_route') as string
  const description = formData.get('description') as string

  if (!title || !approver_route) {
    throw new Error('Invalid form data')
  }

  const { error } = await supabase
    .from('approvals')
    .insert([{
      user_id: user.id,
      title,
      amount,
      priority,
      approver_route,
      description,
      status: '承認待ち'
    }])

  if (error) {
    console.error('Error inserting approval:', error)
    throw error
  }

  revalidatePath('/approvals')
}

export async function getApproval(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('approvals')
    .select(`
      *,
      profiles:user_id ( full_name, department, role )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching approval:', error)
    return null
  }

  const { getProfile } = await import('./profile')
  const profile = await getProfile()

  if (data.user_id !== user.id && profile?.role === '一般') return null

  return {
    ...data,
    applicant_name: data.profiles?.full_name || '不明',
    applicant_department: data.profiles?.department || '不明'
  }
}

export async function getPendingApprovals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { getProfile } = await import('./profile')
  const profile = await getProfile()
  if (!profile || profile.role === '一般') {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('approvals')
    .select(`
      *,
      profiles:user_id ( full_name, department )
    `)
    .eq('status', '承認待ち')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending approvals:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    applicant_name: item.profiles?.full_name || '不明',
    applicant_department: item.profiles?.department || '不明'
  }))
}

export async function updateApprovalStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { getProfile } = await import('./profile')
  const profile = await getProfile()
  if (!profile || profile.role === '一般') {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('approvals')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating approval status:', error)
    throw error
  }

  if (!data || data.length === 0) {
    console.error(`Row not updated. Check RLS policies for approvals. User ID: ${user.id}, Approval ID: ${id}`);
    throw new Error('You do not have permission to update this record or it does not exist.')
  }

  revalidatePath('/management')
  revalidatePath(`/approvals/${id}`)
  revalidatePath('/approvals')

  redirect('/management?tab=approvals')
}

export async function getApprovalHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { getProfile } = await import('./profile')
  const profile = await getProfile()
  if (!profile || profile.role === '一般') {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('approvals')
    .select(`
      *,
      profiles:user_id ( full_name, department )
    `)
    .neq('status', '承認待ち')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching approval history:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    applicant_name: item.profiles?.full_name || '不明',
    applicant_department: item.profiles?.department || '不明'
  }))
}
