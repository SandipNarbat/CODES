from database import SessionLocal
from models import Customer, Item


def seed_data():
    """Insert demo customers and items if tables are empty."""
    db = SessionLocal()
    try:
        if db.query(Customer).count() == 0:
            customers = [
                Customer(name="Rahul Sharma", phone="9876543210"),
                Customer(name="Priya Patel", phone="9123456780"),
                Customer(name="Amit Verma", phone="9988776655"),
                Customer(name="Sunita Joshi", phone="9001122334"),
                Customer(name="Deepak Nair", phone="9345678901"),
            ]
            db.add_all(customers)

        if db.query(Item).count() == 0:
            items = [
                Item(name="Samsung Galaxy A15", price=12999, gst_rate=18, stock_qty=50),
                Item(name="Redmi Note 13",       price=17499, gst_rate=18, stock_qty=35),
                Item(name="Realme C65",           price=10499, gst_rate=18, stock_qty=60),
                Item(name="Vivo Y18",             price=11999, gst_rate=18, stock_qty=40),
                Item(name="Oppo A3x",             price=9999,  gst_rate=18, stock_qty=45),
                Item(name="Mobile Cover (Universal)", price=199, gst_rate=12, stock_qty=200),
                Item(name="Tempered Glass",       price=149,   gst_rate=12, stock_qty=300),
                Item(name="Type-C Charger 33W",   price=799,   gst_rate=18, stock_qty=100),
                Item(name="Earbuds TWS",          price=1299,  gst_rate=18, stock_qty=80),
                Item(name="Power Bank 10000mAh",  price=1599,  gst_rate=18, stock_qty=60),
            ]
            db.add_all(items)

        db.commit()
        print("✅ Demo data seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"⚠️  Seed error: {e}")
    finally:
        db.close()