import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { initDb } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const db = await initDb();

const STAGES = ["Lead", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];

// List / filter contacts
app.get("/api/contacts", (req, res) => {
  const { stage, q } = req.query;
  let contacts = db.data.contacts;
  if (stage) contacts = contacts.filter((c) => c.stage === stage);
  if (q) {
    const needle = q.toLowerCase();
    contacts = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.company.toLowerCase().includes(needle)
    );
  }
  res.json(contacts);
});

app.get("/api/stages", (_req, res) => res.json(STAGES));

app.get("/api/stats", (_req, res) => {
  const contacts = db.data.contacts;
  const totalValue = contacts.reduce((sum, c) => sum + (c.value || 0), 0);
  const byStage = STAGES.map((stage) => ({
    stage,
    count: contacts.filter((c) => c.stage === stage).length,
    value: contacts
      .filter((c) => c.stage === stage)
      .reduce((s, c) => s + (c.value || 0), 0),
  }));
  res.json({ total: contacts.length, totalValue, byStage });
});

app.post("/api/contacts", async (req, res) => {
  const contact = {
    id: nanoid(8),
    name: req.body.name || "Unnamed",
    company: req.body.company || "",
    email: req.body.email || "",
    phone: req.body.phone || "",
    stage: req.body.stage || "Lead",
    value: Number(req.body.value) || 0,
    notes: req.body.notes || "",
    createdAt: Date.now(),
  };
  db.data.contacts.unshift(contact);
  await db.write();
  res.status(201).json(contact);
});

app.put("/api/contacts/:id", async (req, res) => {
  const idx = db.data.contacts.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.data.contacts[idx] = { ...db.data.contacts[idx], ...req.body };
  await db.write();
  res.json(db.data.contacts[idx]);
});

app.delete("/api/contacts/:id", async (req, res) => {
  db.data.contacts = db.data.contacts.filter((c) => c.id !== req.params.id);
  await db.write();
  res.status(204).end();
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Mini CRM server running on :${PORT}`));
