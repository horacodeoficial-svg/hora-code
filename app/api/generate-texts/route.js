import { generateSiteTexts } from "@/lib/openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  const { orderId } = await req.json();
  if (!orderId) return new Response(JSON.stringify({ error: "orderId required" }), { status: 400 });

  const { data: order, error: oErr } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (oErr || !order) return new Response(JSON.stringify({ error: "order not found" }), { status: 404 });

  const texts = await generateSiteTexts({
    businessName: order.business_name,
    shortDescription: order.short_description,
    services: order.services,
    primaryColor: order.primary_color
  });

  const { data, error } = await supabase.from("texts").insert([{
    order_id: orderId,
    headline: texts.headline,
    subheadline: texts.subheadline,
    about: texts.about,
    services: texts.services,
    cta1: texts.cta1,
    cta2: texts.cta2,
    footer: texts.footer
  }]).select().single();

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  await supabase.from("orders").update({ status: "texts_generated", updated_at: new Date() }).eq("id", orderId);

  return new Response(JSON.stringify({ texts: data }), { status: 200 });
}
