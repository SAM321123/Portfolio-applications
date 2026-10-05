import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { initDb } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const db = await initDb();
const STATUSES = ["todo", "in-progress", "done"];

app.get("/api/tasks", (_req, res) => {
  res.json(db.data.tasks.sort((a, b) => a.order - b.order));
});

app.post("/api/tasks", async (req, res) => {
  const task = {
    id: nanoid(8),
    title: req.body.title || "Untitled task",
    status: STATUSES.includes(req.body.status) ? req.body.status : "todo",
    priority: req.body.priority || "medium",
    assignee: req.body.assignee || "",
    order: db.data.tasks.length,
    createdAt: Date.now(),
  };
  db.data.tasks.push(task);
  await db.write();
  res.status(201).json(task);
});

app.put("/api/tasks/:id", async (req, res) => {
  const idx = db.data.tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.data.tasks[idx] = { ...db.data.tasks[idx], ...req.body };
  await db.write();
  res.json(db.data.tasks[idx]);
});

// Reorder / move between columns
app.post("/api/tasks/reorder", async (req, res) => {
  const { orderedIds, status } = req.body; // ids in new order for a given column
  orderedIds.forEach((id, i) => {
    const t = db.data.tasks.find((t) => t.id === id);
    if (t) {
      t.order = i;
      if (status) t.status = status;
    }
  });
  await db.write();
  res.json(db.data.tasks);
});

app.delete("/api/tasks/:id", async (req, res) => {
  db.data.tasks = db.data.tasks.filter((t) => t.id !== req.params.id);
  await db.write();
  res.status(204).end();
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Kanban server running on :${PORT}`));
