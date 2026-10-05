from collections import defaultdict
from datetime import date

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CATEGORIES = ["Food", "Transport", "Housing", "Entertainment", "Utilities", "Shopping", "Health", "Other"]


@app.on_event("startup")
def seed():
    db = next(get_db())
    if db.query(models.Expense).count() == 0:
        samples = [
            {"description": "Grocery run", "category": "Food", "amount": 62.40, "date": date(2026, 8, 3)},
            {"description": "Metro pass", "category": "Transport", "amount": 30.00, "date": date(2026, 8, 5)},
            {"description": "Rent", "category": "Housing", "amount": 950.00, "date": date(2026, 8, 1)},
            {"description": "Movie night", "category": "Entertainment", "amount": 24.00, "date": date(2026, 8, 10)},
            {"description": "Electricity bill", "category": "Utilities", "amount": 78.20, "date": date(2026, 8, 12)},
            {"description": "New headphones", "category": "Shopping", "amount": 89.99, "date": date(2026, 9, 2)},
            {"description": "Gym membership", "category": "Health", "amount": 40.00, "date": date(2026, 9, 4)},
            {"description": "Coffee", "category": "Food", "amount": 5.50, "date": date(2026, 9, 6)},
        ]
        for s in samples:
            db.add(models.Expense(**s))
        db.commit()


@app.get("/api/categories")
def get_categories():
    return CATEGORIES


@app.get("/api/expenses", response_model=list[schemas.ExpenseOut])
def list_expenses(category: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Expense)
    if category:
        q = q.filter(models.Expense.category == category)
    return q.order_by(models.Expense.date.desc()).all()


@app.post("/api/expenses", response_model=schemas.ExpenseOut, status_code=201)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    data = expense.model_dump()
    if not data.get("date"):
        data["date"] = date.today()
    db_expense = models.Expense(**data)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.delete("/api/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(exp)
    db.commit()


@app.get("/api/summary", response_model=schemas.Summary)
def summary(db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).all()
    total = sum(e.amount for e in expenses)
    count = len(expenses)

    by_category = defaultdict(float)
    by_month = defaultdict(float)
    for e in expenses:
        by_category[e.category] += e.amount
        key = e.date.strftime("%Y-%m")
        by_month[key] += e.amount

    return schemas.Summary(
        total_spent=round(total, 2),
        expense_count=count,
        average_expense=round(total / count, 2) if count else 0,
        by_category=[
            schemas.CategoryTotal(category=c, total=round(v, 2)) for c, v in by_category.items()
        ],
        by_month=dict(sorted(by_month.items())),
    )
