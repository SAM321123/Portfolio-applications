from datetime import date

from pydantic import BaseModel


class ExpenseBase(BaseModel):
    description: str
    category: str = "Other"
    amount: float
    date: date | None = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseOut(ExpenseBase):
    id: int
    date: date

    class Config:
        from_attributes = True


class CategoryTotal(BaseModel):
    category: str
    total: float


class Summary(BaseModel):
    total_spent: float
    expense_count: int
    average_expense: float
    by_category: list[CategoryTotal]
    by_month: dict[str, float]
