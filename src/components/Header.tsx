import { User } from 'lucide-react'
import { getProfile } from '@/app/actions/profile'

export async function Header() {
  let profile = null
  try {
    profile = await getProfile()
  } catch (e) {
    // If not logged in or error, profile remains null
  }

  if (!profile) {
    return (
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 shrink-0">
      </header>
    )
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-bold shadow-sm">
          <User className="h-4 w-4 mr-2 text-indigo-500" />
          <span>{profile.role} ({profile.full_name})</span>
        </div>
      </div>
    </header>
  )
}
