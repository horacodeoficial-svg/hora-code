"use client";

import { useEffect, useState } from "react";

export default function PreviewPage({ params }) {
  const { id } = params;
  const [html, setHtml] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/layout-by-order?orderId=${id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Erro ao carregar preview");
          return;
        }
        setHtml(json.html);
      } catch (e) {
        setError(e.message || "Erro ao carregar preview");
      }
    }
    load();
  }, [id]);

  if (error) return <div>Erro: {error}</div>;
  if (!html) return <div>Carregando preview...</div>;

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
