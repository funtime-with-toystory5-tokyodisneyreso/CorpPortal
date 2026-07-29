'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return {
    ...data,
    email: user.email
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const full_name = formData.get('full_name') as string
  const department = formData.get('department') as string

  if (!full_name) {
    throw new Error('Full name is required')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, department })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) throw new Error('Not authenticated')

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  })

  if (signInError) {
    throw new Error('現在のパスワードが間違っています')
  }

  // Update password
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    console.error('Error updating password:', error)
    throw error
  }

  return { success: true }
}
