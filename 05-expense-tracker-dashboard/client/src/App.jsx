import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8001/api";
const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ec4899", "#06b6d4", "#eab308", "#8b5cf6", "#94a3b8"];

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", category: "Other", amount: "", date: "" });

  const load = async () => {
    const params = filterCategory ? `?category=${filterCategory}` : "";
    const [e, c, s] = await Promise.all([
      fetch(`${API}/expenses${params}`).then((r) => r.json()),
      fetch(`${API}/categories`).then((r) => r.json()),
      fetch(`${API}/summary`).then((r) => r.json()),
    ]);
    setExpenses(e);
    setCategories(c);
    setSummary(s);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filterCategory]);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    await fetch(`${API}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount), date: form.date || null }),
    });
    setForm({ description: "", category: "Other", amount: "", date: "" });
    setShowForm(false);
    load();
  };

  const removeExpense = async (id) => {
    await fetch(`${API}/expenses/${id}`, { method: "DELETE" });
    load();
  };

  const monthData = summary
    ? Object.entries(summary.by_month).map(([month, total]) => ({ month, total }))
    : [];

  return (
    <div className="dash">
      <header className="dash-header">
        <h1>💰 Expense Tracker</h1>
        <button className="primary" onClick={() => setShowForm(true)}>+ Add Expense</button>
      </header>

      {summary && (
        <div className="summary-row">
          <div className="summary-card">
            <span className="label">Total Spent</span>
            <span className="value">${summary.total_spent.toLocaleString()}</span>
          </div>
          <div className="summary-card">
            <span className="label">Expenses</span>
            <span className="value">{summary.expense_count}</span>
          </div>
          <div className="summary-card">
            <span className="label">Average</span>
            <span className="value">${summary.average_expense.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="charts-row">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={summary?.by_category || []}
                dataKey="total"
                nameKey="category"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {(summary?.by_category || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Spending by Month</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `$${v}`} />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="toolbar">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <table className="expense-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{e.description}</td>
              <td><span className="tag">{e.category}</span></td>
              <td>{e.date}</td>
              <td>${e.amount.toFixed(2)}</td>
              <td><button className="delete" onClick={() => removeExpense(e.id)}>✕</button></td>
            </tr>
          ))}
          {expenses.length === 0 && (
            <tr><td colSpan={5} className="empty">No expenses yet.</td></tr>
          )}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={addExpense}>
            <h2>New Expense</h2>
            <input required autoFocus placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Amount ($)" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="primary">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
