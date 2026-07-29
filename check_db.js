const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('expenses').select('*');
  console.log('Total expenses:', data ? data.length : 0);
  if (data) {
    const pending = data.filter(d => d.status === '³”F‘Ò‚¿');
    console.log('Pending expenses:', pending.length);
    if (pending.length > 0) {
      console.log('Pending IDs:', pending.map(p => p.id));
    }
  }
}
check();
