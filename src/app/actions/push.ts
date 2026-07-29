'use server'

import { createClient } from '@/utils/supabase/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys from environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@example.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  )
}

export async function saveSubscription(subscription: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Prevent duplicates by checking if endpoint already exists for this user
  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('endpoint', subscription.endpoint)
    .single()

  if (existing) {
    return { success: true }
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .insert([{
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }])

  if (error) {
    console.error('Error saving subscription:', error)
    throw error
  }

  return { success: true }
}

export async function deleteSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('Error deleting subscription:', error)
    throw error
  }

  return { success: true }
}

// Example function to send a notification to a specific user
export async function sendNotificationToUser(userId: string, payload: { title: string, body: string, url?: string }) {
  const supabase = await createClient()
  
  // Get all subscriptions for the user
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error || !subscriptions || subscriptions.length === 0) {
    return { success: false, error: 'No subscriptions found' }
  }

  const notifications = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    }

    try {
      await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
    } catch (e: any) {
      console.error('Error sending push notification:', e)
      // If subscription is invalid/expired (status 410 or 404), remove it from the database
      if (e.statusCode === 410 || e.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id)
      }
    }
  })

  await Promise.all(notifications)
  return { success: true }
}

// Action for the user to test their own notification
export async function sendTestNotification() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  return await sendNotificationToUser(user.id, {
    title: 'プッシュ通知のテスト',
    body: 'プッシュ通知が正常に設定されました！',
    url: '/settings'
  })
}
