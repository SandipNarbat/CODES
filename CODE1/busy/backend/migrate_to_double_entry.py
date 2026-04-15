import sqlite3
import shutil
import os
from datetime import datetime

DB_PATH = "smart_billing.db"
BACKUP_PATH = "smart_billing_backup.db"

def migrate():
    print("Starting migration to Double Entry Accounts...")
    if not os.path.exists(DB_PATH):
        print("Database not found. Exiting.")
        return

    # 1. Backup DB
    shutil.copy2(DB_PATH, BACKUP_PATH)
    print(f"Backed up {DB_PATH} to {BACKUP_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 2. Check if already migrated
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions';")
    if cursor.fetchone():
        print("Already migrated to transactions.")
        conn.close()
        return

    # 3. Create new tables
    print("Creating new tables...")
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR NOT NULL UNIQUE,
            type VARCHAR NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vouchers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME,
            voucher_type VARCHAR NOT NULL,
            ref_id INTEGER
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            voucher_id INTEGER NOT NULL,
            account_id INTEGER NOT NULL,
            debit FLOAT DEFAULT 0.0,
            credit FLOAT DEFAULT 0.0,
            FOREIGN KEY(voucher_id) REFERENCES vouchers(id),
            FOREIGN KEY(account_id) REFERENCES accounts(id)
        );
    """)

    # 4. Create base accounts
    print("Creating base accounts...")
    cursor.execute("INSERT OR IGNORE INTO accounts (name, type) VALUES ('Cash', 'Cash')")
    cursor.execute("INSERT OR IGNORE INTO accounts (name, type) VALUES ('Sales', 'Sales')")

    # 5. Bring customers into Accounts and set account_id
    # Ensure customer table has account_id column
    try:
        cursor.execute("ALTER TABLE customers ADD COLUMN account_id INTEGER REFERENCES accounts(id);")
    except sqlite3.OperationalError:
        pass # Column might exist
        
    print("Migrating customers to accounts...")
    cursor.execute("SELECT id, name FROM customers")
    customers = cursor.fetchall()
    
    for c_id, c_name in customers:
        cursor.execute("INSERT OR IGNORE INTO accounts (name, type) VALUES (?, 'Customer')", (c_name,))
        cursor.execute("SELECT id FROM accounts WHERE name = ?", (c_name,))
        acc_id = cursor.fetchone()[0]
        cursor.execute("UPDATE customers SET account_id = ? WHERE id = ?", (acc_id, c_id))

    # 6. Migrate ledger_entries to vouchers and transactions
    print("Migrating ledger entries to double-entry system...")
    try:
        cursor.execute("SELECT id, customer_id, account, debit, credit, ref_id, date FROM ledger_entries")
        entries = cursor.fetchall()
        
        # We need to logically pair them into vouchers. 
        # A SALE created two rows (customer DR, sales CR). 
        # A PAYMENT created one row? "account=payment" DR=0 CR=X. Wait, payment was one row!
        
        # We'll create one voucher per distinct invoice (SALE) or entry (PAYMENT).
        # Actually grouped by date + ref_id might be risky. Let's just process them properly.
        # It's better to just read them and recreate.
        # But wait, we can just look closely at how LedgerEntry was created.
        
        # Let's process "customer" and "payment" entries. "sales" was redundant in the old code.
        for row in entries:
            l_id, c_id, account, debit, credit, ref_id, date = row
            
            if account == "sales":
                # Skip the explicit "sales" row from the old scheme because we will recreate it when we see the "customer" row for the same invoice
                continue
                
            cursor.execute("SELECT account_id FROM customers WHERE id = ?", (c_id,))
            c_acc_id = cursor.fetchone()[0]
            
            if account == "customer": # This was SALE
                v_type = "SALE"
                cursor.execute("INSERT INTO vouchers (date, voucher_type, ref_id) VALUES (?, ?, ?)", (date, v_type, ref_id))
                v_id = cursor.lastrowid
                
                # Debit Customer
                cursor.execute("INSERT INTO transactions (voucher_id, account_id, debit, credit) VALUES (?, ?, ?, ?)", 
                               (v_id, c_acc_id, debit, credit))
                # Credit Sales
                cursor.execute("SELECT id FROM accounts WHERE name = 'Sales'")
                sales_id = cursor.fetchone()[0]
                cursor.execute("INSERT INTO transactions (voucher_id, account_id, debit, credit) VALUES (?, ?, ?, ?)", 
                               (v_id, sales_id, 0.0, debit)) # Since debit > 0 for this entry
                               
            elif account == "payment": # This was RECEIPT
                v_type = "RECEIPT"
                cursor.execute("INSERT INTO vouchers (date, voucher_type, ref_id) VALUES (?, ?, ?)", (date, v_type, ref_id))
                v_id = cursor.lastrowid
                
                # Credit Customer
                cursor.execute("INSERT INTO transactions (voucher_id, account_id, debit, credit) VALUES (?, ?, ?, ?)", 
                               (v_id, c_acc_id, 0.0, credit))
                # Debit Cash
                cursor.execute("SELECT id FROM accounts WHERE name = 'Cash'")
                cash_id = cursor.fetchone()[0]
                cursor.execute("INSERT INTO transactions (voucher_id, account_id, debit, credit) VALUES (?, ?, ?, ?)", 
                               (v_id, cash_id, credit, 0.0))

        # 7. Drop ledger_entries
        print("Backup and migration successful. Dropping ledger_entries table...")
        cursor.execute("DROP TABLE ledger_entries")
    
    except sqlite3.OperationalError as e:
        print(f"Skipping ledger entries migration: {e}")

    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
