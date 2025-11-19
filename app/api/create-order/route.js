import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  const payload = await req.json();

  const { data, error } = await supabase
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

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  const orderId = data.id;
  const token = jwt.sign({ orderId }, process.env.JWT_SECRET, { expiresIn: "24h" });

  return new Response(JSON.stringify({ order: data, previewToken: token }), { status: 201 });
}
