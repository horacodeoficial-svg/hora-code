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

  async function handleSubmit() {
    try {
      setLoading(true);
      setMsg("Criando pedido...");

      // 1️⃣ Criar pedido
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const orderJson = await orderRes.json();

      if (!orderRes.ok) {
        setMsg("Erro criando pedido: " + JSON.stringify(orderJson));
        setLoading(false);
        return;
      }

      const orderId = orderJson.order.id;
      setMsg("Pedido criado! Gerando textos...");

      // 2️⃣ Gerar textos
      const textRes = await fetch("/api/generate-texts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      if (!textRes.ok) {
        setMsg("Erro gerando textos.");
        setLoading(false);
        return;
      }

      setMsg("Textos gerados! Gerando layout...");

      // 3️⃣ Gerar layout
      const layoutRes = await fetch("/api/generate-layout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      if (!layoutRes.ok) {
        setMsg("Erro gerando layout.");
        setLoading(false);
        return;
      }

      setMsg("Layout gerado com sucesso!");

    } catch (err) {
      setMsg("Erro inesperado: " + err.message);
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
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: "10px 18px", background: "#0A84FF", color: "#fff", border: "none", borderRadius: 6 }}
        >
          {loading ? "Processando..." : "Criar meu site"}
        </button>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </main>
    </div>
  );
}