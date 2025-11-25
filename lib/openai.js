import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildFallbackTexts(businessName, shortDescription, services) {
  const safeServices = Array.isArray(services)
    ? services.filter(Boolean)
    : services
    ? [services]
    : ["Serviço principal"];

  return {
    headline: `${businessName || "Sua empresa"} - soluções profissionais`,
    subheadline:
      shortDescription ||
      "Serviços profissionais para organizar, crescer e simplificar o seu negócio.",
    about:
      shortDescription ||
      "Este texto foi gerado automaticamente como fallback. Em breve você poderá personalizar tudo isso pelo painel da HORA CODE.",
    services: safeServices,
    cta1: "Fale conosco",
    cta2: "Quero saber mais",
    footer: `© ${businessName || "Sua empresa"} - Site gerado pela HORA CODE`
  };
}

export async function generateSiteTexts(payload) {
  const { businessName, shortDescription, services, primaryColor } = payload;

  const system =
    "Você é um copywriter especialista em sites de pequenas e médias empresas. " +
    "Tom: profissional, direto, consultivo e simples. Gere textos claros, objetivos e que foquem em benefícios.";

  const userPrompt = `
Dados do negócio:
- Nome: ${businessName}
- Descrição: ${shortDescription}
- Serviços: ${Array.isArray(services) ? services.join(", ") : services}
- Cor principal: ${primaryColor}

Tarefa:
Crie os textos para um site de uma página.

Regras:
- Escreva em português do Brasil.
- Seja direto, sem enrolação.
- Fale com o dono do negócio, de forma profissional.
- NÃO invente informações específicas (como endereço, preços, etc).

Retorne EXATAMENTE neste formato JSON:

{
  "headline": "...",
  "subheadline": "...",
  "about": "...",
  "services": ["...", "...", "..."],
  "cta1": "...",
  "cta2": "...",
  "footer": "..."
}
`;

  // Se não tiver API key, já devolve fallback e evita quebrar tudo
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY não configurada – usando textos fallback.");
    return buildFallbackTexts(businessName, shortDescription, services);
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 600,
      temperature: 0.4,
      response_format: { type: "json_object" } // força devolver JSON
    });

    const raw = completion.choices[0].message.content;

    try {
      const parsed = JSON.parse(raw);
      // garantia de que services seja sempre array
      if (!Array.isArray(parsed.services)) {
        parsed.services = Array.isArray(services)
          ? services
          : services
          ? [services]
          : [];
      }
      return parsed;
    } catch (e) {
      console.error("Erro ao fazer JSON.parse do retorno da OpenAI:", e);
      return buildFallbackTexts(businessName, shortDescription, services);
    }
  } catch (err) {
    console.error("Erro na chamada da OpenAI:", err);
    return buildFallbackTexts(businessName, shortDescription, services);
  }
}