import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSiteTexts(payload) {
  const { businessName, shortDescription, services, primaryColor } = payload;

  const system = `Você é um assistente que cria textos persuasivos para sites de pequenas empresas. Tom: profissional, direto, consultivo. Seja claro, curto e converta.`;

  const userPrompt = `
Dados:
Nome: ${businessName}
Descrição: ${shortDescription}
Serviços: ${Array.isArray(services) ? services.join(", ") : services}
Cores: ${primaryColor}

Gere:
- Headline (8-12 palavras)
- Subheadline (1 frase)
- Sobre nós (120-160 palavras)
- Lista de serviços (3 bullets curtos)
- CTA curto 1 (2-4 palavras)
- CTA curto 2 (2-4 palavras)
- Texto de rodapé (1 frase)
Retorne em JSON com chaves: headline, subheadline, about, services, cta1, cta2, footer
`;

  const completion = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 500,
    temperature: 0.2
  });

  const raw = completion.choices[0].message.content;

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    const result = {
      headline: lines[0] || `${businessName} - Solução rápida`,
      subheadline: lines[1] || shortDescription || "",
      about: lines.slice(2,6).join(" ") || shortDescription || "",
      services: services,
      cta1: "Quero agora",
      cta2: "Ver planos",
      footer: `© ${businessName}`
    };
    return result;
  }
}
