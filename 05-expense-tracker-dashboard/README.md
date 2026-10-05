# 💰 Expense Tracker Dashboard

A personal finance dashboard for logging expenses and visualizing spending. Built with **React** and **Python (FastAPI)**.

## Features
- Add/delete expenses with category, amount, and date
- Auto-seeded sample data on first run
- Dashboard summary: total spent, expense count, average
- Pie chart of spending by category, bar chart of spending by month (Recharts)
- Filter expenses by category

## Tech Stack
- **Frontend:** React 18, Vite, Recharts
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite

## Getting Started

### 1. Start the backend
```bash
cd server
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```
This creates a local `expenses.db` SQLite file and seeds a few sample expenses.

### 2. Start the frontend
```bash
cd client
npm install
npm run dev   # http://localhost:5177
```

## API Overview
| Method | Endpoint              | Description               |
|--------|-------------------------|-----------------------------|
| GET    | /api/expenses             | List expenses (optional ?category=) |
| POST   | /api/expenses             | Add an expense             |
| DELETE | /api/expenses/{id}        | Delete an expense          |
| GET    | /api/summary               | Totals, category & monthly breakdown |
| GET    | /api/categories             | List available categories  |

## Possible Extensions
- Budgets per category with alerts
- CSV import/export
- Multi-user accounts with auth
- Recurring expenses
