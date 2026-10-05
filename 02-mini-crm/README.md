# 📇 Mini CRM

A lightweight Customer Relationship Management tool for tracking leads and deals through a sales pipeline. Built with **React** and **Node.js**.

## Features
- Contact/lead management (create, edit, delete)
- Sales pipeline stages: Lead → Contacted → Proposal → Negotiation → Won/Lost
- Search and filter by stage or name/company
- Dashboard stats: total contacts, pipeline value, count per stage
- Inline stage updates

## Tech Stack
- **Frontend:** React 18, Vite
- **Backend:** Node.js, Express REST API
- **Storage:** lowdb (local JSON file — swap for MongoDB/Postgres in production)

## Getting Started

### 1. Start the backend
```bash
cd server
npm install
npm run dev   # http://localhost:4001
```

### 2. Start the frontend
```bash
cd client
npm install
npm run dev   # http://localhost:5174
```

## API Overview
| Method | Endpoint              | Description          |
|--------|------------------------|-----------------------|
| GET    | /api/contacts           | List/search contacts |
| POST   | /api/contacts           | Create a contact     |
| PUT    | /api/contacts/:id       | Update a contact     |
| DELETE | /api/contacts/:id       | Delete a contact     |
| GET    | /api/stats               | Pipeline stats       |

## Possible Extensions
- Authentication & multi-user workspaces
- Activity timeline / email logging
- Kanban-style drag-and-drop pipeline view
- Export to CSV
