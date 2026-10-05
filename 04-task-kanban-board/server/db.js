import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "data", "db.json");

const defaultData = { tasks: [] };
const adapter = new JSONFile(file);
const db = new Low(adapter, defaultData);

const seed = [
  { title: "Design landing page", status: "todo", priority: "high", assignee: "Sanjay" },
  { title: "Set up CI/CD pipeline", status: "todo", priority: "medium", assignee: "Team" },
  { title: "Build REST API for auth", status: "in-progress", priority: "high", assignee: "Sanjay" },
  { title: "Write unit tests", status: "in-progress", priority: "low", assignee: "QA" },
  { title: "Deploy to staging", status: "done", priority: "medium", assignee: "DevOps" },
];

export async function initDb() {
  await db.read();
  db.data ||= defaultData;
  if (db.data.tasks.length === 0) {
    db.data.tasks = seed.map((t, i) => ({
      id: `t${i + 1}`,
      order: i,
      createdAt: Date.now(),
      ...t,
    }));
    await db.write();
  }
  return db;
}

export default db;
