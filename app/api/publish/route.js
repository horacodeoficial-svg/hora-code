import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  const { orderId } = await req.json();
  if (!orderId) return new Response(JSON.stringify({ error: "orderId required" }), { status: 400 });

  const { data: layout } = await supabase.from("layouts").select("*").eq("order_id", orderId).single();
  if (!layout) return new Response(JSON.stringify({ error: "layout not found" }), { status: 404 });

  try {
    const { data } = await supabase.storage.from("sites").upload(`${orderId}/index.html`, Buffer.from(layout.html_content), {
      contentType: "text/html",
      upsert: true
    });
    const publicUrl = supabase.storage.from("sites").getPublicUrl(`${orderId}/index.html`).publicURL;
    await supabase.from("orders").update({ status: "published", updated_at: new Date() }).eq("id", orderId);
    return new Response(JSON.stringify({ publishedUrl: publicUrl }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || e }), { status: 500 });
  }
}
