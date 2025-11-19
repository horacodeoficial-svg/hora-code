import { createHTMLFromTexts } from "@/lib/generateLayout";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  const { orderId } = await req.json();
  if (!orderId) return new Response(JSON.stringify({ error: "orderId required" }), { status: 400 });

  const { data: texts } = await supabase.from("texts").select("*").eq("order_id", orderId).single();
  if (!texts) return new Response(JSON.stringify({ error: "texts not found" }), { status: 404 });

  const palette = { primary: "#0A84FF" };
  const html = createHTMLFromTexts({
    headline: texts.headline,
    subheadline: texts.subheadline,
    about: texts.about,
    services: texts.services,
    cta1: texts.cta1,
    footer: texts.footer
  }, palette);

  const { data, error } = await supabase.from("layouts").insert([{
    order_id: orderId,
    html_content: html,
    assets: {},
    palette
  }]).select().single();

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  await supabase.from("orders").update({ status: "layout_generated", updated_at: new Date() }).eq("id", orderId);

  return new Response(JSON.stringify({ layout: data }), { status: 200 });
}
