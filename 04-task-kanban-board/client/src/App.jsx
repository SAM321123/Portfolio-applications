import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4002/api";
const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "done", label: "Done" },
];
const PRIORITIES = ["low", "medium", "high"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "medium", assignee: "", status: "todo" });
  const [dragId, setDragId] = useState(null);

  const load = () => fetch(`${API}/tasks`).then((r) => r.json()).then(setTasks);

  useEffect(() => { load(); }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", priority: "medium", assignee: "", status: "todo" });
    setShowForm(false);
    load();
  };

  const removeTask = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    load();
  };

  const onDrop = async (status) => {
    if (!dragId) return;
    const columnTasks = tasks.filter((t) => t.status === status && t.id !== dragId);
    const orderedIds = [...columnTasks.map((t) => t.id), dragId];
    await fetch(`${API}/tasks/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds, status }),
    });
    setDragId(null);
    load();
  };

  return (
    <div className="board-page">
      <header className="board-header">
        <h1>🗂️ Task Kanban Board</h1>
        <button className="primary" onClick={() => setShowForm(true)}>+ New Task</button>
      </header>

      <div className="board">
        {COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.order - b.order);
          return (
            <div
              key={col.id}
              className="column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
            >
              <div className="column-header">
                <h2>{col.label}</h2>
                <span className="count">{colTasks.length}</span>
              </div>
              <div className="column-body">
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className="card"
                    draggable
                    onDragStart={() => setDragId(t.id)}
                  >
                    <div className={`priority priority-${t.priority}`}>{t.priority}</div>
                    <p className="card-title">{t.title}</p>
                    <div className="card-footer">
                      <span className="assignee">{t.assignee || "Unassigned"}</span>
                      <button className="delete" onClick={() => removeTask(t.id)}>✕</button>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && <div className="empty-col">Drop tasks here</div>}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={addTask}>
            <h2>New Task</h2>
            <input required autoFocus placeholder="Task title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Assignee" value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })} />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="primary">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
