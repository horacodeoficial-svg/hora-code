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
    publishOption: "subdomain",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // 1) Criar o pedido no backend
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      const orderJson = await orderRes.json();

      if (!orderRes.ok) {
        console.error("Erro create-order:", orderJson);
        setMsg("Erro ao criar o pedido. Tenta novamente.");
        setLoading(false);
        return;
      }

      const orderId = orderJson.order.id;

      // 2) Gerar textos com IA
      const textsRes = await fetch("/api/generate-texts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const textsJson = await textsRes.json();

      if (!textsRes.ok) {
        console.error("Erro generate-texts:", textsJson);
        setMsg("Pedido criado, mas houve erro ao gerar os textos.");
        setLoading(false);
        return;
      }

      // 3) Gerar layout (HTML)
      const layoutRes = await fetch("/api/generate-layout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const layoutJson = await layoutRes.json();

      if (!layoutRes.ok) {
        console.error("Erro generate-layout:", layoutJson);
        setMsg("Textos gerados, mas houve erro ao montar o layout.");
        setLoading(false);
        return;
      }

      // Se chegou aqui, deu tudo certo 🎉
      setMsg("Site gerado com sucesso! Agora é só configurar preview/publicação.");
    } catch (err) {
      console.error("Erro geral no fluxo:", err);
      setMsg("Erro inesperado. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <header
        style={{
          background: "#0A84FF",
          color: "#fff",
          padding: 30,
          textAlign: "center",
        }}
      >
        <h1>HORA CODE — Ideias viram software em horas</h1>
        <p>Site profissional em até 24h</p>
      </header>

      <main
        style={{
          maxWidth: 900,
          margin: "30px auto",
          padding: "0 20px",
        }}
      >
        <h2>Crie seu site agora</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Nome do negócio"
            value={form.businessName}
            onChange={(e) =>
              setForm({ ...form, businessName: e.target.value })
            }
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
            required
          />
          <input
            placeholder="Seu nome"
            value={form.responsibleName}
            onChange={(e) =>
              setForm({ ...form, responsibleName: e.target.value })
            }
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
            required
          />
          <input
            placeholder="Telefone/WhatsApp"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
            required
          />
          <textarea
            placeholder="Descrição curta do negócio"
            value={form.shortDescription}
            onChange={(e) =>
              setForm({ ...form, shortDescription: e.target.value })
            }
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              background: "#0A84FF",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {loading ? "Gerando seu site..." : "Quero meu site agora"}
          </button>
        </form>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </main>
    </div>
  );
}