import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return new Response(JSON.stringify({ error: "orderId required" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("layouts")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "layout not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ html: data.html_content }), { status: 200 });
}