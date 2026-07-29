'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    date: new Date(item.created_at).toLocaleDateString('ja-JP')
  }))
}

export async function getExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching expense:', error)
    return null
  }

  const { getProfile } = await import('./profile')
  const profile = await getProfile()
  
  // Ensure user can only view their own expenses, unless they are a manager
  if (data.user_id !== user.id && profile?.role === '一般') return null

  return {
    ...data,
    date: new Date(data.created_at).toLocaleDateString('ja-JP')
  }
}

export async function insertExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const date = formData.get('date') as string
  const category = formData.get('category') as string
  const amount = parseInt(formData.get('amount') as string, 10)
  const description = formData.get('description') as string
  const receiptImage = formData.get('receipt_image') as File | null

  let receipt_image_url = null

  if (receiptImage && receiptImage.size > 0) {
    const fileExt = receiptImage.name.split('.').pop()
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, receiptImage)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
    } else if (uploadData) {
      const { data } = supabase.storage.from('receipts').getPublicUrl(fileName)
      receipt_image_url = data.publicUrl
    }
  }

  if (!date || !category || isNaN(amount)) {
    throw new Error('Invalid form data')
  }

  const { error } = await supabase
    .from('expenses')
    .insert([{
      user_id: user.id,
      date,
      category,
      amount,
      description,
      receipt_image_url,
      status: '承認待ち'
    }])

  if (error) {
    console.error('Error inserting expense:', error)
    throw error
  }

  revalidatePath('/expenses')
}

export async function getPendingExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { getProfile } = await import('./profile')
  const profile = await getProfile()
  if (!profile || profile.role === '一般') {
    throw new Error('Unauthorized')
  }

  // We'll fetch all pending expenses, and joining with profiles to get applicant's name.
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      profiles:user_id ( full_name, department )
    `)
    .eq('status', '承認待ち')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending expenses:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    date: new Date(item.created_at).toLocaleDateString('ja-JP'),
    applicant_name: item.profiles?.full_name || '不明',
    applicant_department: item.profiles?.department || '不明'
  }))
}

export async function updateExpenseStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { getProfile } = await import('./profile')
  const profile = await getProfile()
  if (!profile || profile.role === '一般') {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('expenses')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating expense status:', error)
    throw error
  }

  if (!data || data.length === 0) {
    console.error(`Row not updated. Check RLS policies for expenses. User ID: ${user.id}, Expense ID: ${id}`);
    throw new Error('You do not have permission to update this record or it does not exist.')
  }

  revalidatePath('/management')
  revalidatePath(`/expenses/${id}`)
  revalidatePath('/expenses')

  redirect('/management?tab=expenses')
}

export async function getExpenseHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { getProfile } = await import('./profile')
  const profile = await getProfile()
  if (!profile || profile.role === '一般') {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      profiles:user_id ( full_name, department )
    `)
    .neq('status', '承認待ち')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching expense history:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    date: new Date(item.created_at).toLocaleDateString('ja-JP'),
    applicant_name: item.profiles?.full_name || '不明',
    applicant_department: item.profiles?.department || '不明'
  }))
}
