from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ── Request schemas ──────────────────────────────────────────────

class InvoiceItemIn(BaseModel):
    item_id: int
    qty: int


class InvoiceCreate(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    items: List[InvoiceItemIn]


class ItemCreate(BaseModel):
    name: str
    price: float
    gst_rate: float = 18.0
    stock_qty: int = 0


class PaymentCreate(BaseModel):
    customer_id: int
    amount: float


# ── Response schemas ─────────────────────────────────────────────

class CustomerOut(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    balance: float = 0.0

    class Config:
        from_attributes = True


class ItemOut(BaseModel):
    id: int
    name: str
    price: float
    gst_rate: float
    stock_qty: int

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    invoice_id: int
    customer_name: str
    total: float
    gst: float
    grand_total: float
    date: datetime

    class Config:
        from_attributes = True


class LedgerEntryOut(BaseModel):
    id: int
    date: datetime
    voucher_type: str
    ref_id: Optional[int]
    debit: float
    credit: float
    balance: float
    dr_cr: str

    class Config:
        from_attributes = True