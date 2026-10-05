# 🗂️ Task Kanban Board

A Trello-style task management board with drag-and-drop columns. Built with **React** and **Node.js**.

## Features
- Three columns: To Do, In Progress, Done
- Native HTML5 drag-and-drop to move tasks between columns and reorder
- Priority tags (low/medium/high) and assignee field
- Create/delete tasks
- REST API with persistent JSON storage

## Tech Stack
- **Frontend:** React 18, Vite (native drag-and-drop, no extra libraries)
- **Backend:** Node.js, Express REST API
- **Storage:** lowdb (local JSON file)

## Getting Started

### 1. Start the backend
```bash
cd server
npm install
npm run dev   # http://localhost:4002
```

### 2. Start the frontend
```bash
cd client
npm install
npm run dev   # http://localhost:5176
```

## API Overview
| Method | Endpoint              | Description                  |
|--------|------------------------|-------------------------------|
| GET    | /api/tasks               | List all tasks               |
| POST   | /api/tasks               | Create a task                |
| PUT    | /api/tasks/:id           | Update a task                |
| POST   | /api/tasks/reorder       | Reorder / move between columns |
| DELETE | /api/tasks/:id           | Delete a task                |

## Possible Extensions
- Multi-board / multi-project support
- User authentication & assignment to real users
- Due dates + calendar view
- Real-time sync across users (Socket.io)
