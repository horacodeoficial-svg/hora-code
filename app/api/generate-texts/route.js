import { generateSiteTexts } from "@/lib/openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ROTA PRINCIPAL – usada pelo fluxo real (POST com orderId)
export async function POST(req) {
  const { orderId } = await req.json();
  if (!orderId) {
    return new Response(JSON.stringify({ error: "orderId required" }), { status: 400 });
  }

  // busca o pedido no banco
  const { data: order, error: oErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (oErr || !order) {
    return new Response(JSON.stringify({ error: "order not found" }), { status: 404 });
  }

  // gera os textos com a OpenAI
  const texts = await generateSiteTexts({
    businessName: order.business_name,
    shortDescription: order.short_description,
    services: order.services,
    primaryColor: order.primary_color,
  });

  // salva na tabela texts
  const { data, error } = await supabase
    .from("texts")
    .insert([
      {
        order_id: orderId,
        headline: texts.headline,
        subheadline: texts.subheadline,
        about: texts.about,
        services: texts.services,
        cta1: texts.cta1,
        cta2: texts.cta2,
        footer: texts.footer,
      },
    ])
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  // atualiza status do pedido
  await supabase
    .from("orders")
    .update({ status: "texts_generated", updated_at: new Date() })
    .eq("id", orderId);

  return new Response(JSON.stringify({ texts: data }), { status: 200 });
}

// GET DE TESTE – só pra você conseguir abrir no navegador
export async function GET() {
  const texts = await generateSiteTexts({
    businessName: "Empresa Teste Hora Code",
    shortDescription: "Uma empresa de exemplo para testar a geração de textos.",
    services: ["Serviço 1", "Serviço 2", "Serviço 3"],
    primaryColor: "#0A84FF",
  });

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Textos gerados com sucesso (rota de teste GET).",
      texts,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    }
  );
}