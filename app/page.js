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
  const [orderId, setOrderId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [publishedUrl, setPublishedUrl] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);

  async function handleCreateSite() {
    try {
      setLoading(true);
      setMsg("");
      setPreviewUrl(null);
      setPublishedUrl(null);

      // 1) Cria o pedido
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const createJson = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createJson.error || "Erro ao criar pedido");
      }

      const id = createJson.order.id;
      setOrderId(id);

      // 2) Gera textos
      const textRes = await fetch("/api/generate-texts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: id })
      });
      const textJson = await textRes.json();
      if (!textRes.ok) {
        throw new Error(textJson.error || "Erro ao gerar textos");
      }

      // 3) Gera layout
      const layoutRes = await fetch("/api/generate-layout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: id })
      });
      const layoutJson = await layoutRes.json();
      if (!layoutRes.ok) {
        throw new Error(layoutJson.error || "Erro ao gerar layout");
      }

      const origin = window.location.origin;
      setPreviewUrl(`${origin}/preview/${id}`);
      setMsg("Site gerado com sucesso! Veja o preview abaixo.");
    } catch (e) {
      console.error(e);
      setMsg("Erro ao gerar site: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!orderId) return;
    try {
      setPublishLoading(true);
      setMsg("");
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erro ao publicar site");
      }
      setPublishedUrl(json.publishedUrl);
      setMsg("Site publicado com sucesso!");
    } catch (e) {
      console.error(e);
      setMsg("Erro ao publicar: " + (e.message || e));
    } finally {
      setPublishLoading(false);
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
          onClick={handleCreateSite}
          disabled={loading}
          style={{ padding: "10px 18px", background: "#0A84FF", color: "#fff", border: "none", borderRadius: 6 }}
        >
          {loading ? "Gerando site..." : "Quero meu site agora"}
        </button>

        {msg && <p style={{ marginTop: 16 }}>{msg}</p>}

        {previewUrl && (
          <div style={{ marginTop: 20 }}>
            <h3>Preview do site</h3>
            <a href={previewUrl} target="_blank" rel="noreferrer">
              Abrir preview em nova aba
            </a>
          </div>
        )}

        {orderId && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={handlePublish}
              disabled={publishLoading}
              style={{ padding: "8px 16px", background: "#0A84FF", color: "#fff", border: "none", borderRadius: 6 }}
            >
              {publishLoading ? "Publicando..." : "Publicar site"}
            </button>
          </div>
        )}

        {publishedUrl && (
          <div style={{ marginTop: 20 }}>
            <h3>Site publicado</h3>
            <a href={publishedUrl} target="_blank" rel="noreferrer">
              Acessar site publicado
            </a>
          </div>
        )}
      </main>
    </div>
  );
}