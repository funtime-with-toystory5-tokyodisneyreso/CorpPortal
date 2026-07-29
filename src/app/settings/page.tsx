"use client"

import { Settings, User, Bell, Shield, LogOut, Check, X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getProfile, updateProfile, signOutAction, updatePassword } from '@/app/actions/profile'
import { saveSubscription, deleteSubscription, sendTestNotification } from '@/app/actions/push'
import { urlBase64ToUint8Array } from '@/utils/push'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('一般')

  // Notification state
  const [pushEnabled, setPushEnabled] = useState(false)

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    // Load profile
    getProfile().then(data => {
      setProfile(data)
      if (data) {
        setFullName(data.full_name || '')
        setDepartment(data.department || '')
        setRole(data.role || '一般')
      }
      setLoading(false)
    })

    // Check push subscription state
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            setPushEnabled(true)
          }
        })
      })
    }
  }, [])

  const handleSave = async () => {
    setSubmitting(true)
    const formData = new FormData()
    formData.append('full_name', fullName)
    formData.append('department', department)

    try {
      await updateProfile(formData)
      setProfile({ ...profile, full_name: fullName, department })
      setIsEditing(false)
    } catch (e) {
      alert('プロフィールの更新に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('このブラウザはプッシュ通知をサポートしていません。')
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        alert('Service Workerが登録されていません。（開発モードではPWAが無効化されている場合があります。npm run build && npm start で確認してください）');
        return;
      }
      
      if (pushEnabled) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await deleteSubscription(subscription.endpoint);
        }
        setPushEnabled(false);
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('プッシュ通知が許可されていません。ブラウザの設定を確認してください。');
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        
        await saveSubscription(JSON.parse(JSON.stringify(subscription)));
        setPushEnabled(true);
      }
    } catch (e: any) {
      console.error('Error toggling push notification:', e);
      alert('プッシュ通知の設定に失敗しました: ' + e.message);
    }
  }

  const handleTestNotification = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await sendTestNotification();
    } catch (e) {
      alert('テスト通知の送信に失敗しました');
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: '現在のパスワードを入力してください' })
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'パスワードは6文字以上にしてください' })
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: '新しいパスワードが一致しません' })
      return;
    }

    setChangingPassword(true)
    setPasswordMessage(null)
    
    try {
      await updatePassword(currentPassword, newPassword)
      setPasswordMessage({ type: 'success', text: 'パスワードを変更しました' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setShowPasswordForm(false), 2000)
    } catch (e: any) {
      setPasswordMessage({ type: 'error', text: e.message || 'パスワードの更新に失敗しました' })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOutAction()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  const initials = profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : '?'

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-4xl mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center">
          <Settings className="w-8 h-8 text-indigo-600 mr-3" />
          設定
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">アカウント情報やアプリの設定を管理します</p>
      </div>

      <div className="space-y-6 flex-1 overflow-auto">
        
        {/* Profile Card */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-indigo-600 tracking-wider uppercase flex items-center">
              <User className="w-4 h-4 mr-2" />
              プロフィール
            </h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                編集する
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
              <span className="text-3xl sm:text-5xl font-black text-white">{initials}</span>
            </div>
            
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">氏名 <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">部署</label>
                      <input 
                        type="text" 
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="例: 開発部"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">役職 (変更不可)</label>
                      <input 
                        type="text" 
                        value={role}
                        disabled
                        className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        setIsEditing(false)
                        setFullName(profile?.full_name || '')
                        setDepartment(profile?.department || '')
                        setRole(profile?.role || '一般')
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      キャンセル
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={submitting || !fullName}
                      className="px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                      保存する
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <h3 className="text-2xl font-black text-slate-800">{profile?.full_name}</h3>
                  <p className="text-slate-500 font-medium mt-2 flex items-center">
                    <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 text-sm mr-2">{profile?.role || '一般'}</span>
                    {profile?.department || '部署未設定'}
                  </p>
                  <p className="text-slate-400 text-sm mt-3 font-mono bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">
                    ID: {profile?.id.slice(0, 13).toUpperCase()}
                  </p>
                  <p className="text-slate-400 text-sm mt-2 ml-1">
                    Email: {profile?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* System Settings */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 pb-2">
            <h2 className="text-sm font-bold text-indigo-600 mb-2 tracking-wider uppercase flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              アプリ設定
            </h2>
          </div>
          
          <div className="divide-y divide-slate-50">
            <div 
              onClick={handleTogglePush}
              className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">プッシュ通知</h4>
                  <p className="text-xs text-slate-500 mt-0.5">稟議の承認や差し戻しを受け取る</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${pushEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${pushEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </div>
            </div>
            
            {pushEnabled && (
              <div className="px-6 pb-6 pt-2 flex justify-end bg-slate-50/20">
                <button 
                  onClick={handleTestNotification}
                  className="text-xs font-bold bg-white text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors"
                >
                  テスト通知を送信
                </button>
              </div>
            )}

            <div className="flex flex-col p-6 hover:bg-slate-50/50 transition-colors">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">セキュリティ</h4>
                    <p className="text-xs text-slate-500 mt-0.5">パスワードの変更</p>
                  </div>
                </div>
                <div className={`text-slate-400 font-bold transition-transform ${showPasswordForm ? 'rotate-90' : ''}`}>›</div>
              </div>

              {showPasswordForm && (
                <div className="mt-4 pl-14 pr-4">
                  <form onSubmit={handleChangePassword} className="space-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">現在のパスワード</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">新しいパスワード</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="6文字以上"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-800"
                        minLength={6}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">新しいパスワード（確認）</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="もう一度入力してください"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-800"
                        minLength={6}
                        required
                      />
                    </div>
                    {passwordMessage && (
                      <div className={`text-xs font-bold p-2 rounded-lg ${passwordMessage.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {passwordMessage.text}
                      </div>
                    )}
                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        disabled={changingPassword || !currentPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                        className="px-4 py-2 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center"
                      >
                        {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        パスワードを変更
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Logout */}
        <section className="pt-4 pb-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-rose-100 text-rose-600 py-4 rounded-2xl font-bold shadow-sm hover:bg-rose-50 transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>ログアウト</span>
          </button>
        </section>

      </div>
    </div>
  )
}
