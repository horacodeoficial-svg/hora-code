'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    fetch('/api/admin/list').then(r => r.json()).then(j => setOrders(j.orders || []));
  }, []);
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Painel Admin - HORA CODE</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}><td>{o.business_name}</td><td>{o.user_name} / {o.email}</td><td>{o.status}</td><td>{new Date(o.created_at).toLocaleString()}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
