import msal
import requests
import json
import os

# ── CONFIG ──────────────────────────────
CLIENT_ID  = "YOUR_CLIENT_ID_HERE"  # from Azure app registration
AUTHORITY  = "https://login.microsoftonline.com/consumers"
SCOPES     = ["Mail.Read", "Mail.ReadWrite", "Mail.Send", "User.Read"]
CACHE_FILE = "token_cache.json"

# ── TOKEN CACHE ──────────────────────────
cache = msal.SerializableTokenCache()
if os.path.exists(CACHE_FILE):
    cache.deserialize(open(CACHE_FILE).read())

# ── BUILD APP ────────────────────────────
app = msal.PublicClientApplication(
    CLIENT_ID,
    authority=AUTHORITY,
    token_cache=cache
)

# ── TRY SILENT LOGIN FIRST ───────────────
token = None
accounts = app.get_accounts()
if accounts:
    result = app.acquire_token_silent(SCOPES, account=accounts[0])
    if result and "access_token" in result:
        token = result["access_token"]
        print("✅ Using cached token — no login needed")

# ── DEVICE CODE FLOW ─────────────────────
if not token:
    flow = app.initiate_device_flow(scopes=SCOPES)

    # ── SHOW EXACTLY WHAT CAME BACK ──────
    if "user_code" not in flow:
        print("\n❌ Device flow failed. Full response:")
        print(json.dumps(flow, indent=2))
        print("\n── Common fixes ──────────────────────")
        print("1. CLIENT_ID is wrong → recheck Azure Overview page")
        print("2. Redirect URI missing → Azure portal → Authentication")
        print("   → Add platform → Mobile/desktop")
        print("   → tick: https://login.microsoftonline.com/common/oauth2/nativeclient")
        print("3. AUTHORITY wrong → must be 'consumers' for personal accounts")
        exit()

    print("\n" + "="*50)
    print(flow["message"])
    print("="*50 + "\n")
    input("Press ENTER after you've logged in on the browser...")

    result = app.acquire_token_by_device_flow(flow)

    if "access_token" in result:
        token = result["access_token"]
        print("✅ Login successful!")
    else:
        print("❌ Token acquisition failed:")
        print("  Error            :", result.get("error"))
        print("  Error description:", result.get("error_description"))
        exit()

# ── SAVE CACHE ───────────────────────────
with open(CACHE_FILE, "w") as f:
    f.write(cache.serialize())

# ── TEST: READ INBOX ─────────────────────
headers = {"Authorization": f"Bearer {token}"}

response = requests.get(
    "https://graph.microsoft.com/v1.0/me/messages",
    headers=headers,
    params={
        "$top": 5,
        "$orderby": "receivedDateTime desc",
        "$select": "subject,from,receivedDateTime,body"
    }
)

if response.status_code != 200:
    print("❌ Graph API error:", response.status_code)
    print(response.json())
    exit()

print("\n📬 Latest 5 emails:")
print("-" * 50)
for mail in response.json().get("value", []):
    sender  = mail.get("from", {}).get("emailAddress", {}).get("address", "unknown")
    subject = mail.get("subject", "(no subject)")
    date    = mail.get("receivedDateTime", "unknown")
    body    = mail.get("body", {}).get("content", "")

    print(f"From   : {sender}")
    print(f"Subject: {subject}")
    print(f"Date   : {date}")
    print(f"Body   : {body}")
    print("-" * 50)