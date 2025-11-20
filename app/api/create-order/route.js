import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { generateSiteTexts } from "@/lib/openai";
import { createHTMLFromTexts } from "@/lib/generateLayout";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  try {
    const payload = await req.json();

    // 1) criar pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        user_name: payload.responsibleName || payload.userName,
        email: payload.email,
        phone: payload.phone,
        business_name: payload.businessName,
        short_description: payload.shortDescription,
        services: payload.services,
        primary_color: payload.primaryColor || "#0A84FF",
        logo_url: payload.logoUrl,
        hero_image_url: payload.heroImageUrl,
        plan: payload.plan || "express",
        publish_option: payload.publishOption || "subdomain",
        price: payload.price || 297
      }])
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      return new Response(JSON.stringify({ error: "Erro ao criar pedido" }), { status: 500 });
    }

    const orderId = order.id;

    // 2) gerar textos com IA
    const texts = await generateSiteTexts({
      businessName: order.business_name,
      shortDescription: order.short_description,
      services: order.services,
      primaryColor: order.primary_color
    });

    const { data: textRow, error: textError } = await supabase.from("texts").insert([{
      order_id: orderId,
      headline: texts.headline,
      subheadline: texts.subheadline,
      about: texts.about,
      services: texts.services,
      cta1: texts.cta1,
      cta2: texts.cta2,
      footer: texts.footer
    }]).select().single();

    if (textError) {
      console.error(textError);
      return new Response(JSON.stringify({ error: "Erro ao salvar textos" }), { status: 500 });
    }

    // 3) gerar HTML do site
    const palette = { primary: order.primary_color || "#0A84FF" };
    const html = createHTMLFromTexts({
      headline: textRow.headline,
      subheadline: textRow.subheadline,
      about: textRow.about,
      services: textRow.services,
      cta1: textRow.cta1,
      footer: textRow.footer
    }, palette);

    const { data: layoutRow, error: layoutError } = await supabase.from("layouts").insert([{
      order_id: orderId,
      html_content: html,
      assets: {},
      palette
    }]).select().single();

    if (layoutError) {
      console.error(layoutError);
      return new Response(JSON.stringify({ error: "Erro ao salvar layout" }), { status: 500 });
    }

    // 4) atualizar status do pedido
    await supabase.from("orders").update({ status: "layout_generated", updated_at: new Date() }).eq("id", orderId);

    // 5) gerar token de preview e URL
    const token = jwt.sign({ orderId }, process.env.JWT_SECRET, { expiresIn: "24h" });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const previewUrl = `${baseUrl}/preview/${orderId}?token=${token}`;

    return new Response(JSON.stringify({ order, previewToken: token, previewUrl }), { status: 201 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
  }
}
