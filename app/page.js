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

 async function createOrder() {
  try {
    setLoading(true);
    setMsg("");

    // 1) Cria o pedido
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();

    if (!res.ok) {
      setLoading(false);
      setMsg("Erro ao criar pedido: " + (json.error || JSON.stringify(json)));
      return;
    }

    const orderId = json.order.id;

    // 2) Gera textos
    const resTexts = await fetch("/api/generate-texts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const jsonTexts = await resTexts.json();

    if (!resTexts.ok) {
      setLoading(false);
      setMsg("Pedido criado, mas erro ao gerar textos: " + (jsonTexts.error || JSON.stringify(jsonTexts)));
      return;
    }

    // 3) Gera layout
    const resLayout = await fetch("/api/generate-layout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const jsonLayout = await resLayout.json();

    if (!resLayout.ok) {
      setLoading(false);
      setMsg("Textos gerados, mas erro ao gerar layout: " + (jsonLayout.error || JSON.stringify(jsonLayout)));
      return;
    }

    setLoading(false);
    setMsg("Seu site foi gerado com sucesso! ID do pedido: " + orderId);
  } catch (e) {
    console.error(e);
    setLoading(false);
    setMsg("Erro inesperado: " + e.message);
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
