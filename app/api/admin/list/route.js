import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET(req) {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
  return new Response(JSON.stringify({ orders: data }), { status: 200 });
}
