from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Customer, Item, Invoice, InvoiceItem, Account, Voucher, Transaction
from schemas import (
    InvoiceCreate, InvoiceResponse,
    CustomerOut, ItemOut, LedgerEntryOut,
    ItemCreate, PaymentCreate
)
from sqlalchemy import func
from datetime import datetime

router = APIRouter()


# ── GET /items ───────────────────────────────────────────────────

@router.get("/items", response_model=List[ItemOut])
async def list_items(db: Session = Depends(get_db)):
    return db.query(Item).all()


# ── POST /items ──────────────────────────────────────────────────

@router.post("/items", response_model=ItemOut)
async def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    existing = db.query(Item).filter(
        Item.name == payload.name, 
        Item.price == payload.price
    ).first()
    
    if existing:
        existing.stock_qty += payload.stock_qty
        db.commit()
        db.refresh(existing)
        return existing

    item = Item(
        name=payload.name,
        price=payload.price,
        gst_rate=payload.gst_rate,
        stock_qty=payload.stock_qty
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# ── GET /customers ───────────────────────────────────────────────

@router.get("/customers", response_model=List[CustomerOut])
async def list_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    result = []
    for c in customers:
        balance = 0.0
        if c.account_id:
            res = db.query(func.sum(Transaction.debit - Transaction.credit)).filter(Transaction.account_id == c.account_id).scalar()
            if res is not None:
                balance = float(res)
        result.append({
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "balance": balance
        })
    return result


# ── GET /ledger/{customer_id} ────────────────────────────────────

@router.get("/ledger/{customer_id}", response_model=List[LedgerEntryOut])
async def get_ledger(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    if not customer.account_id:
        return []

    balance_expr = func.sum(Transaction.debit - Transaction.credit).over(
        order_by=(Voucher.date, Transaction.id)
    ).label('balance')

    entries = (
        db.query(
            Transaction.id.label("id"),
            Voucher.date.label("date"),
            Voucher.voucher_type.label("voucher_type"),
            Voucher.ref_id.label("ref_id"),
            Transaction.debit.label("debit"),
            Transaction.credit.label("credit"),
            balance_expr
        )
        .join(Voucher, Transaction.voucher_id == Voucher.id)
        .filter(Transaction.account_id == customer.account_id)
        .order_by(Voucher.date, Transaction.id)
        .all()
    )

    result = []
    for e in entries:
        bal = float(e.balance)
        dr_cr = "Dr" if bal >= 0 else "Cr"
        result.append({
            "id": e.id,
            "date": e.date,
            "voucher_type": e.voucher_type,
            "ref_id": e.ref_id,
            "debit": float(e.debit),
            "credit": float(e.credit),
            "balance": bal,
            "dr_cr": dr_cr
        })
    return result


# ── POST /ledger/payment ───────────────────────────────────────────

@router.post("/ledger/payment", response_model=LedgerEntryOut)
async def record_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if not customer.account_id:
        # Create an account for them if missing (legacy data fail-safe)
        acc = Account(name=customer.name, type="Customer")
        db.add(acc)
        db.flush()
        customer.account_id = acc.id
        db.add(customer)
        db.flush()
        
    cash_acc = db.query(Account).filter(Account.name == "Cash").first()
    if not cash_acc:
        cash_acc = Account(name="Cash", type="Cash")
        db.add(cash_acc)
        db.flush()
        
    voucher = Voucher(
        voucher_type="RECEIPT",
        date=datetime.utcnow(),
        ref_id=None
    )
    db.add(voucher)
    db.flush()

    t_cr = Transaction(
        voucher_id=voucher.id,
        account_id=customer.account_id,
        debit=0.0,
        credit=payload.amount
    )
    t_dr = Transaction(
        voucher_id=voucher.id,
        account_id=cash_acc.id,
        debit=payload.amount,
        credit=0.0
    )
    
    db.add(t_cr)
    db.add(t_dr)
    db.commit()
    
    return {
        "id": t_cr.id,
        "date": voucher.date,
        "voucher_type": voucher.voucher_type,
        "ref_id": voucher.ref_id,
        "debit": t_cr.debit,
        "credit": t_cr.credit,
        "balance": 0.0,
        "dr_cr": "Cr"
    }


# ── POST /invoice ────────────────────────────────────────────────

@router.post("/invoice", response_model=InvoiceResponse)
async def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    customer = None
    
    if payload.customer_phone:
        customer = db.query(Customer).filter(Customer.phone == payload.customer_phone).first()
        
    if not customer and payload.customer_name:
        customer = db.query(Customer).filter(Customer.name == payload.customer_name).first()

    if not customer:
        account = Account(name=payload.customer_name, type="Customer")
        db.add(account)
        db.flush()
        customer = Customer(name=payload.customer_name, phone=payload.customer_phone, account_id=account.id)
        db.add(customer)
        db.flush()

    if not customer.account_id:
        account = Account(name=customer.name, type="Customer")
        db.add(account)
        db.flush()
        customer.account_id = account.id
        db.add(customer)
        db.flush()

    total = 0.0
    gst_total = 0.0
    line_items = []

    # Process each item in the invoice
    for entry in payload.items:
        item = db.query(Item).filter(Item.id == entry.item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item {entry.item_id} not found")
        if item.stock_qty < entry.qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{item.name}'. Available: {item.stock_qty}"
            )

        line_price = item.price * entry.qty
        line_gst = line_price * (item.gst_rate / 100)

        total += line_price
        gst_total += line_gst
        line_items.append((item, entry.qty, line_price, line_gst))

    grand_total = total + gst_total

    try:
        # Create invoice record
        invoice = Invoice(
            customer_id=customer.id,
            total=round(total, 2),
            gst_total=round(gst_total, 2)
        )
        db.add(invoice)
        db.flush()  # get invoice.id before committing

        # Insert invoice line items + reduce stock
        for item, qty, line_price, line_gst in line_items:
            inv_item = InvoiceItem(
                invoice_id=invoice.id,
                item_id=item.id,
                qty=qty,
                price=round(line_price, 2),
                gst=round(line_gst, 2)
            )
            db.add(inv_item)
            item.stock_qty -= qty  # deduct from inventory

        # Voucher
        voucher = Voucher(voucher_type="SALE", date=invoice.date, ref_id=invoice.id)
        db.add(voucher)
        db.flush()

        # Ledger: Customer Debit (they owe us)
        db.add(Transaction(
            voucher_id=voucher.id,
            account_id=customer.account_id,
            debit=round(grand_total, 2),
            credit=0.0
        ))

        # Ledger: Sales Credit
        sales_acc = db.query(Account).filter(Account.name == "Sales").first()
        if not sales_acc:
            sales_acc = Account(name="Sales", type="Sales")
            db.add(sales_acc)
            db.flush()
            
        db.add(Transaction(
            voucher_id=voucher.id,
            account_id=sales_acc.id,
            debit=0.0,
            credit=round(grand_total, 2)
        ))

        db.commit()
        db.refresh(invoice)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")

    return InvoiceResponse(
        invoice_id=invoice.id,
        customer_name=customer.name,
        total=round(total, 2),
        gst=round(gst_total, 2),
        grand_total=round(grand_total, 2),
        date=invoice.date
    )