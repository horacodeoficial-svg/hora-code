export function createHTMLFromTexts(texts, palette = { primary: "#0A84FF" }) {
  const primary = palette.primary || "#0A84FF";
  const servicesHtml = (texts.services || []).map(s => `<li>${s}</li>`).join("");
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${texts.headline}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; margin:0; padding:0; color:#222; }
      header { background:${primary}; color:#fff; padding:40px 20px; text-align:center; }
      .container { max-width:900px; margin: 30px auto; padding: 0 20px; }
      .btn { background:${primary}; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block; margin-top:12px; }
      footer { text-align:center; margin:40px 0; color:#666; }
      ul.services { list-style: disc; padding-left:20px; }
      @media (max-width:600px){ header { padding:22px 12px } }
    </style>
  </head>
  <body>
    <header>
      <h1>${texts.headline}</h1>
      <p>${texts.subheadline}</p>
      <a class="btn" href="tel:"> ${texts.cta1} </a>
    </header>

    <div class="container">
      <section>
        <h2>Sobre nós</h2>
        <p>${texts.about}</p>
      </section>

      <section>
        <h2>Serviços</h2>
        <ul class="services">
          ${servicesHtml}
        </ul>
      </section>

      <section>
        <h2>Contato</h2>
        <p>Chame no WhatsApp ou ligue agora.</p>
      </section>
    </div>

    <footer>
      <p>${texts.footer}</p>
    </footer>
  </body>
  </html>
  `;
  return html;
}
