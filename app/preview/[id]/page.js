import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function generateMetadata() {
  return { title: 'Preview - HORA CODE' };
}

export default async function PreviewPage({ params, searchParams }) {
  const token = searchParams.token;
  if (!token) {
    return <div>Token missing</div>;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.orderId !== params.id) return <div>Invalid token</div>;
    const { data: layout } = await supabase.from('layouts').select('*').eq('order_id', params.id).single();
    if (!layout) return <div>Layout not found</div>;
    return <div dangerouslySetInnerHTML={{ __html: layout.html_content }} />;
  } catch (e) {
    return <div>Invalid or expired token</div>;
  }
}
