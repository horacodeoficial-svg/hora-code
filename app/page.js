"use client";
import { useState } from "react";

export default function Page() {
  const [form, setForm] = useState({
    businessName: "",
    responsibleName: "",
    email: "",
    phone: "",
    shortDescription: "",
    services: ["", "", ""],
    primaryColor: "#0A84FF",
    plan: "express",
    publishOption: "subdomain"
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  async function handleClick() {
    try {
      setLoading(true);
      setMsg("Criando pedido...");
      setPreviewUrl("");

      // 1) cria o pedido no banco (orders)
      const resOrder = await fetch("/api/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      const jsonOrder = await resOrder.json();

      if (!resOrder.ok) {
        console.error(jsonOrder);
        setMsg("Erro ao criar pedido.");
        setLoading(false);
        return;
      }

      const orderId = jsonOrder.order.id;
      const previewToken = jsonOrder.previewToken;

      setMsg("Gerando textos com IA...");

      // 2) gera os textos com IA
      const resTexts = await fetch("/api/generate-texts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const jsonTexts = await resTexts.json();
      if (!resTexts.ok) {
        console.error(jsonTexts);
        setMsg("Erro ao gerar textos.");
        setLoading(false);
        return;
      }

      setMsg("Montando layout do site...");

      // 3) gera o layout HTML
      const resLayout = await fetch("/api/generate-layout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const jsonLayout = await resLayout.json();
      if (!resLayout.ok) {
        console.error(jsonLayout);
        setMsg("Erro ao gerar layout.");
        setLoading(false);
        return;
      }

      // 4) monta o link de preview (mesmo domínio)
      const url = `/preview/${orderId}?token=${previewToken}`;
      setPreviewUrl(url);
      setMsg("Site gerado com sucesso! Veja o preview abaixo 👇");
    } catch (e) {
      console.error(e);
      setMsg("Erro inesperado ao gerar o site.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <header style={{ background: "#0A84FF", color: "#fff", padding: 30, textAlign: "center" }}>
        <h1>HORA CODE — Ideias viram software em horas</h1>
        <p>Site profissional em até 24h</p>
      </header>

      <main style={{ maxWidth: 900, margin: "30px auto", padding: "0 20px" }}>
        <h2>Crie seu site agora</h2>

        <input
          placeholder="Nome do negócio"
          value={form.businessName}
          onChange={e => setForm({ ...form, businessName: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          placeholder="Seu nome"
          value={form.responsibleName}
          onChange={e => setForm({ ...form, responsibleName: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          placeholder="Telefone/WhatsApp"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <textarea
          placeholder="Descrição curta do negócio"
          value={form.shortDescription}
          onChange={e => setForm({ ...form, shortDescription: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />

        <button
          onClick={handleClick}
          disabled={loading}
          style={{
            padding: "10px 18px",
            background: "#0A84FF",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "default" : "pointer"
          }}
        >
          {loading ? "Gerando seu site..." : "Quero meu site agora"}
        </button>

        {msg && <p style={{ marginTop: 16 }}>{msg}</p>}

        {previewUrl && (
          <p style={{ marginTop: 12 }}>
            Preview:{" "}
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              abrir site gerado
            </a>
          </p>
        )}
      </main>
    </div>
  );
}
