import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "data", "db.json");

const defaultData = { contacts: [], deals: [] };
const adapter = new JSONFile(file);
const db = new Low(adapter, defaultData);

export async function initDb() {
  await db.read();
  db.data ||= defaultData;

  if (db.data.contacts.length === 0) {
    db.data.contacts = [
      {
        id: "c1",
        name: "Ava Thompson",
        company: "Nimbus Retail",
        email: "ava@nimbusretail.com",
        phone: "+1 555-0102",
        stage: "Lead",
        value: 4500,
        notes: "Interested in enterprise plan.",
        createdAt: Date.now(),
      },
      {
        id: "c2",
        name: "Marcus Lee",
        company: "Brightforge Labs",
        email: "marcus@brightforge.io",
        phone: "+1 555-0139",
        stage: "Negotiation",
        value: 12000,
        notes: "Waiting on legal review.",
        createdAt: Date.now(),
      },
      {
        id: "c3",
        name: "Priya Nair",
        company: "Vantage Health",
        email: "priya@vantagehealth.com",
        phone: "+1 555-0187",
        stage: "Won",
        value: 8000,
        notes: "Signed annual contract.",
        createdAt: Date.now(),
      },
    ];
    await db.write();
  }

  return db;
}

export default db;
