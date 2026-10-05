import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
const EMPTY_FORM = { name: "", company: "", email: "", phone: "", stage: "Lead", value: "", notes: "" };

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [stages, setStages] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filterStage) params.set("stage", filterStage);
    const [c, s, st] = await Promise.all([
      fetch(`${API}/contacts?${params}`).then((r) => r.json()),
      fetch(`${API}/stages`).then((r) => r.json()),
      fetch(`${API}/stats`).then((r) => r.json()),
    ]);
    setContacts(c);
    setStages(s);
    setStats(st);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filterStage]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`${API}/contacts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(`${API}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    resetForm();
    load();
  };

  const edit = (c) => {
    setForm({ ...c });
    setEditingId(c.id);
    setShowForm(true);
  };

  const remove = async (id) => {
    if (!confirm("Delete this contact?")) return;
    await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
    load();
  };

  const changeStage = async (c, stage) => {
    await fetch(`${API}/contacts/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    load();
  };

  return (
    <div className="crm">
      <header className="topbar">
        <h1>📇 Mini CRM</h1>
        <button className="primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + New Contact
        </button>
      </header>

      {stats && (
        <div className="stats">
          <div className="stat-card">
            <span className="label">Total Contacts</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="stat-card">
            <span className="label">Pipeline Value</span>
            <span className="value">${stats.totalValue.toLocaleString()}</span>
          </div>
          {stats.byStage.map((s) => (
            <div className="stat-card small" key={s.stage}>
              <span className="label">{s.stage}</span>
              <span className="value">{s.count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="toolbar">
        <input
          placeholder="Search name or company…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
          <option value="">All stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <table className="contacts-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Contact</th>
            <th>Stage</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.company}</td>
              <td>
                <div className="muted">{c.email}</div>
                <div className="muted">{c.phone}</div>
              </td>
              <td>
                <select value={c.stage} onChange={(e) => changeStage(c, e.target.value)}>
                  {stages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td>${Number(c.value).toLocaleString()}</td>
              <td className="row-actions">
                <button onClick={() => edit(c)}>Edit</button>
                <button className="danger" onClick={() => remove(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {contacts.length === 0 && (
            <tr><td colSpan={6} className="empty">No contacts found.</td></tr>
          )}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-backdrop" onClick={resetForm}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h2>{editingId ? "Edit Contact" : "New Contact"}</h2>
            <input required placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Company" value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input placeholder="Email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {stages.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <input placeholder="Deal value ($)" type="number" value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <textarea placeholder="Notes" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="modal-actions">
              <button type="button" onClick={resetForm}>Cancel</button>
              <button type="submit" className="primary">{editingId ? "Save" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
