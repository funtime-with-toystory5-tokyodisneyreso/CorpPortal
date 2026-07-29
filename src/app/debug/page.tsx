import { createClient } from '@/utils/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('expenses').select('*')
  
  return (
    <div>
      <h1>Debug Expenses</h1>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  )
}