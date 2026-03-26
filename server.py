"""
Flatifigo Backend — Flask + SQLite / PostgreSQL
Handles: auth (JWT + bcrypt), profiles, listings, search
"""

import os
import json
import uuid
import logging
import sqlite3
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import Config

# ── Logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if Config.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("flatifigo")

# ── App Setup ────────────────────────────────────────────────────
app = Flask(__name__, static_folder=".", static_url_path="")

cors_origins = Config.CORS_ORIGINS
if cors_origins == "*":
    CORS(app)
else:
    CORS(app, origins=[o.strip() for o in cors_origins.split(",")])

app.config["MAX_CONTENT_LENGTH"] = Config.MAX_CONTENT_LENGTH

UPLOAD_FOLDER = Config.UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ── Database Setup ───────────────────────────────────────────────

def _sqlite_path() -> str:
    """Return the SQLite file path derived from DATABASE_URL."""
    url = Config.DATABASE_URL
    if url.startswith("sqlite:///"):
        rel = url[len("sqlite:///"):]
        if not os.path.isabs(rel):
            return os.path.join(os.path.dirname(__file__), rel)
        return rel
    return os.path.join(os.path.dirname(__file__), "flatifigo.db")


DB_PATH = _sqlite_path()


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS profiles (
            user_id TEXT PRIMARY KEY REFERENCES users(id),
            occupation TEXT DEFAULT '',
            gender_preference TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            budget_min INTEGER DEFAULT 0,
            budget_max INTEGER DEFAULT 0,
            preferred_city TEXT DEFAULT '',
            preferred_area TEXT DEFAULT '',
            lifestyle TEXT DEFAULT '',
            schedule TEXT DEFAULT '',
            updated_at TEXT,
            avatar TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS listings (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            rent INTEGER NOT NULL,
            city TEXT NOT NULL,
            area TEXT NOT NULL,
            rooms INTEGER NOT NULL,
            amenities TEXT DEFAULT '[]',
            images TEXT DEFAULT '[]',
            status TEXT DEFAULT 'available',
            contact_name TEXT NOT NULL,
            contact_phone TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            views INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        );
    """)
    # Inline migrations: add columns that may not exist in older databases
    for stmt in (
        "ALTER TABLE listings ADD COLUMN images TEXT DEFAULT '[]'",
        "ALTER TABLE listings ADD COLUMN status TEXT DEFAULT 'available'",
        "ALTER TABLE profiles ADD COLUMN avatar TEXT DEFAULT ''",
    ):
        try:
            db.execute(stmt)
        except sqlite3.OperationalError:
            pass  # column already exists
    # Seed sample listings if the table is empty
    if db.execute("SELECT COUNT(*) FROM listings").fetchone()[0] == 0:
        _seed_listings(db)
    db.commit()
    db.close()
    logger.info("Database initialised at %s", DB_PATH)


def _seed_listings(db: sqlite3.Connection) -> None:
    samples = [
        (
            "listing_s1",
            "Spacious 2-Bedroom Flat near FAST University",
            "A well-furnished 2-bedroom flat in H-13, Islamabad. Perfect for FAST or NUST students. Walking distance to main road.",
            12000, "islamabad", "H-13", 2,
            '["wifi","furnished","parking","security"]', '["1.jpg.jpeg"]',
            "Ahmed Khan", "0300-1234567", "sample_1", "Ahmed Khan", 127,
        ),
        (
            "listing_s2",
            "Cozy Single Room in Shared Flat - Bahria Town",
            "One furnished room in a 3-bedroom shared flat at Bahria Town Phase 4. AC installed, shared kitchen.",
            8000, "islamabad", "Bahria Town Phase 4", 1,
            '["wifi","furnished","ac","kitchen"]', '["2.jpg.jpeg"]',
            "Hassan Ali", "0312-9876543", "sample_2", "Hassan Ali", 89,
        ),
        (
            "listing_s3",
            "Budget-Friendly Room near UET Lahore",
            "Affordable single room in GT Road area near UET Lahore. Basic furniture provided. Utilities included.",
            5500, "lahore", "GT Road, Near UET", 1,
            '["furnished","utilities"]', '[]',
            "Usman Tariq", "0321-5551234", "sample_3", "Usman Tariq", 56,
        ),
        (
            "listing_s4",
            "Premium 3-Bedroom Apartment - F-10 Islamabad",
            "Luxurious 3-bedroom apartment in F-10 Markaz. Fully furnished with modern kitchen, lounge, and balcony.",
            25000, "islamabad", "F-10 Markaz", 3,
            '["wifi","furnished","ac","kitchen","parking","laundry","security"]', '[]',
            "Shahid Mahmood", "0333-4445566", "sample_4", "Shahid Mahmood", 203,
        ),
        (
            "listing_s5",
            "Shared Room for Students - Rawalpindi Saddar",
            "Shared room available near Saddar, Rawalpindi. Close to Murree Road bus stops. Ideal for male students.",
            4000, "rawalpindi", "Saddar", 1,
            '["utilities","kitchen"]', '[]',
            "Bilal Shahzad", "0345-6667788", "sample_5", "Bilal Shahzad", 42,
        ),
        (
            "listing_s6",
            "Modern Studio Apartment - DHA Lahore",
            "Newly renovated studio apartment in DHA Phase 5. Fully furnished with AC. Perfect for single professionals.",
            18000, "lahore", "DHA Phase 5", 1,
            '["wifi","furnished","ac","kitchen","security","parking"]', '[]',
            "Rehan Aslam", "0300-9998877", "sample_6", "Rehan Aslam", 164,
        ),
    ]
    for s in samples:
        db.execute(
            "INSERT INTO listings "
            "(id,title,description,rent,city,area,rooms,amenities,images,status,"
            "contact_name,contact_phone,owner_id,owner_name,views,created_at) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (
                s[0], s[1], s[2], s[3], s[4], s[5], s[6],
                s[7], s[8], "available",
                s[9], s[10], s[11], s[12], s[13],
                datetime.now(timezone.utc).isoformat(),
            ),
        )


# ── Password Hashing ──────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


# ── JWT Authentication ────────────────────────────────────────────

def create_token(user: dict) -> str:
    payload = {
        "id": user["id"],
        "fullName": user["full_name"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")


def verify_token(token: str):
    """Decode and verify a JWT token. Returns the payload dict or None."""
    try:
        return jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        logger.debug("Token expired")
        return None
    except jwt.InvalidTokenError:
        logger.debug("Invalid token")
        return None


def _get_current_user():
    """Extract and verify the JWT from the Authorization header."""
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    if not token:
        return None
    return verify_token(token)


# ── Health Check ──────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "flatifigo"})


# ── Serve Frontend ────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/uploads/<filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# ── Auth Routes ───────────────────────────────────────────────────

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json or {}
    name = data.get("fullName", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm = data.get("confirmPassword", "")
    role = data.get("role", "")

    if not all([name, email, password, confirm, role]):
        return jsonify({"success": False, "message": "All fields are required."}), 400
    if len(name) < 2:
        return jsonify({"success": False, "message": "Name must be at least 2 characters."}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters."}), 400
    if password != confirm:
        return jsonify({"success": False, "message": "Passwords do not match."}), 400

    db = get_db()
    try:
        existing = db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
        if existing:
            return jsonify({"success": False, "message": "An account with this email already exists."}), 409

        user_id = "user_" + str(uuid.uuid4())[:8]
        db.execute(
            "INSERT INTO users (id, full_name, email, password_hash, role, created_at) VALUES (?,?,?,?,?,?)",
            (user_id, name, email, hash_password(password), role, datetime.now(timezone.utc).isoformat()),
        )
        db.execute("INSERT INTO profiles (user_id) VALUES (?)", (user_id,))
        db.commit()
    finally:
        db.close()

    user = {"id": user_id, "full_name": name, "email": email, "role": role}
    token = create_token(user)
    logger.info("New user registered: %s (%s)", email, role)
    return jsonify({
        "success": True,
        "message": "Account created successfully!",
        "token": token,
        "user": {"id": user_id, "fullName": name, "email": email, "role": role},
    })


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    db = get_db()
    try:
        user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    finally:
        db.close()

    if not user or not check_password(password, user["password_hash"]):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    token = create_token(dict(user))
    logger.info("User logged in: %s", email)
    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['full_name']}!",
        "token": token,
        "user": {
            "id": user["id"],
            "fullName": user["full_name"],
            "email": user["email"],
            "role": user["role"],
        },
    })


@app.route("/api/session", methods=["GET"])
def check_session():
    user = _get_current_user()
    if user:
        return jsonify({"loggedIn": True, "user": user})
    return jsonify({"loggedIn": False})


@app.route("/api/logout", methods=["POST"])
def logout():
    # JWT is stateless — the client simply discards the token.
    return jsonify({"success": True})


# ── Profile Routes ────────────────────────────────────────────────

@app.route("/api/profile", methods=["GET"])
def get_profile():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    db = get_db()
    try:
        profile = db.execute("SELECT * FROM profiles WHERE user_id=?", (user["id"],)).fetchone()
    finally:
        db.close()
    return jsonify({"success": True, "profile": dict(profile) if profile else {}})


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.json or {}
    db = get_db()
    try:
        db.execute(
            """UPDATE profiles SET occupation=?, gender_preference=?, bio=?,
               budget_min=?, budget_max=?, preferred_city=?, preferred_area=?,
               lifestyle=?, schedule=?, updated_at=? WHERE user_id=?""",
            (
                data.get("occupation", ""), data.get("genderPreference", ""),
                data.get("bio", ""), data.get("budgetMin", 0), data.get("budgetMax", 0),
                data.get("preferredCity", ""), data.get("preferredArea", ""),
                data.get("lifestyle", ""), data.get("schedule", ""),
                datetime.now(timezone.utc).isoformat(), user["id"],
            ),
        )
        db.commit()
    finally:
        db.close()
    return jsonify({"success": True, "message": "Profile updated successfully!"})


@app.route("/api/roommates", methods=["GET"])
def get_roommates():
    db = get_db()
    try:
        rows = db.execute("""
            SELECT u.id, u.full_name, u.role, p.occupation, p.gender_preference, p.bio,
                   p.budget_min, p.budget_max, p.preferred_city, p.preferred_area, p.avatar
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            WHERE u.role != 'owner'
        """).fetchall()
    finally:
        db.close()
    return jsonify({"success": True, "roommates": [dict(r) for r in rows]})


@app.route("/api/profile/avatar", methods=["POST"])
def upload_avatar():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    if "avatar" not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400

    f = request.files["avatar"]
    if not f or not allowed_file(f.filename):
        return jsonify({"success": False, "message": "Invalid file type"}), 400

    ext = secure_filename(f.filename).rsplit(".", 1)[1].lower()
    filename = f"avatar_{user['id']}_{uuid.uuid4().hex[:6]}.{ext}"
    f.save(os.path.join(UPLOAD_FOLDER, filename))

    db = get_db()
    try:
        old = db.execute("SELECT avatar FROM profiles WHERE user_id=?", (user["id"],)).fetchone()
        if old and old["avatar"]:
            old_path = os.path.join(UPLOAD_FOLDER, old["avatar"])
            if os.path.exists(old_path):
                os.remove(old_path)
        db.execute("UPDATE profiles SET avatar=? WHERE user_id=?", (filename, user["id"]))
        db.commit()
    finally:
        db.close()
    return jsonify({"success": True, "filename": filename, "message": "Avatar updated!"})


@app.route("/api/profile/avatar", methods=["DELETE"])
def delete_avatar():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    db = get_db()
    try:
        old = db.execute("SELECT avatar FROM profiles WHERE user_id=?", (user["id"],)).fetchone()
        if old and old["avatar"]:
            old_path = os.path.join(UPLOAD_FOLDER, old["avatar"])
            if os.path.exists(old_path):
                os.remove(old_path)
        db.execute("UPDATE profiles SET avatar='' WHERE user_id=?", (user["id"],))
        db.commit()
    finally:
        db.close()
    return jsonify({"success": True, "message": "Avatar removed!"})


# ── Listing Routes ────────────────────────────────────────────────

@app.route("/api/listings", methods=["GET"])
def get_listings():
    db = get_db()
    query = request.args.get("q", "").lower()
    city = request.args.get("city", "")
    min_rent = request.args.get("minRent", "")
    max_rent = request.args.get("maxRent", "")
    rooms = request.args.get("rooms", "")

    sql = "SELECT * FROM listings WHERE 1=1"
    params = []
    if query:
        sql += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(area) LIKE ? OR LOWER(city) LIKE ?)"
        params.extend([f"%{query}%"] * 4)
    if city:
        sql += " AND city=?"
        params.append(city)
    if min_rent:
        sql += " AND rent>=?"
        params.append(int(min_rent))
    if max_rent:
        sql += " AND rent<=?"
        params.append(int(max_rent))
    if rooms:
        sql += " AND rooms=?"
        params.append(int(rooms))
    sql += " ORDER BY created_at DESC"

    try:
        rows = db.execute(sql, params).fetchall()
    finally:
        db.close()

    listings = []
    for r in rows:
        d = dict(r)
        d["amenities"] = json.loads(d["amenities"])
        d["images"] = json.loads(d.get("images", "[]") or "[]")
        listings.append(d)
    return jsonify({"success": True, "listings": listings})


@app.route("/api/listings", methods=["POST"])
def create_listing():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.json or {}
    title = data.get("title", "").strip()
    desc = data.get("description", "").strip()
    rent = data.get("rent", 0)
    city = data.get("city", "")
    area = data.get("area", "").strip()
    rooms = data.get("rooms", 0)
    amenities = json.dumps(data.get("amenities", []))
    images = json.dumps(data.get("images", []))
    contact_name = data.get("contactName", "").strip()
    contact_phone = data.get("contactPhone", "").strip()

    if not all([title, desc, rent, city, area, rooms]):
        return jsonify({"success": False, "message": "Please fill in all required fields."}), 400

    listing_id = "listing_" + str(uuid.uuid4())[:8]
    db = get_db()
    try:
        db.execute(
            "INSERT INTO listings "
            "(id,title,description,rent,city,area,rooms,amenities,images,status,"
            "contact_name,contact_phone,owner_id,owner_name,views,created_at) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (
                listing_id, title, desc, int(rent), city, area, int(rooms),
                amenities, images, "available",
                contact_name, contact_phone,
                user["id"], user["fullName"], 0,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        db.commit()
    finally:
        db.close()
    return jsonify({"success": True, "message": "Listing published successfully!", "id": listing_id})


@app.route("/api/listings/<listing_id>", methods=["GET"])
def get_listing(listing_id):
    db = get_db()
    try:
        row = db.execute("SELECT * FROM listings WHERE id=?", (listing_id,)).fetchone()
        if row:
            db.execute("UPDATE listings SET views=views+1 WHERE id=?", (listing_id,))
            db.commit()
    finally:
        db.close()
    if not row:
        return jsonify({"success": False, "message": "Listing not found"}), 404
    d = dict(row)
    d["amenities"] = json.loads(d["amenities"])
    d["images"] = json.loads(d.get("images", "[]") or "[]")
    return jsonify({"success": True, "listing": d})


@app.route("/api/listings/<listing_id>", methods=["PUT"])
def update_listing(listing_id):
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    db = get_db()
    try:
        existing = db.execute(
            "SELECT * FROM listings WHERE id=? AND owner_id=?", (listing_id, user["id"])
        ).fetchone()
        if not existing:
            return jsonify({"success": False, "message": "Listing not found or not authorized"}), 404
        data = request.json or {}
        db.execute(
            """UPDATE listings SET title=?, description=?, rent=?, city=?, area=?, rooms=?,
               amenities=?, images=?, status=?, contact_name=?, contact_phone=?
               WHERE id=? AND owner_id=?""",
            (
                data.get("title", ""), data.get("description", ""),
                int(data.get("rent", 0)), data.get("city", ""), data.get("area", ""),
                int(data.get("rooms", 0)),
                json.dumps(data.get("amenities", [])), json.dumps(data.get("images", [])),
                data.get("status", "available"),
                data.get("contactName", ""), data.get("contactPhone", ""),
                listing_id, user["id"],
            ),
        )
        db.commit()
    finally:
        db.close()
    return jsonify({"success": True, "message": "Listing updated successfully!"})


@app.route("/api/listings/<listing_id>", methods=["DELETE"])
def delete_listing(listing_id):
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    db = get_db()
    try:
        existing = db.execute(
            "SELECT * FROM listings WHERE id=? AND owner_id=?", (listing_id, user["id"])
        ).fetchone()
        if not existing:
            return jsonify({"success": False, "message": "Listing not found or not authorized"}), 404
        for img in json.loads(existing["images"] or "[]"):
            path = os.path.join(UPLOAD_FOLDER, img)
            if os.path.exists(path):
                os.remove(path)
        db.execute("DELETE FROM listings WHERE id=? AND owner_id=?", (listing_id, user["id"]))
        db.commit()
    finally:
        db.close()
    return jsonify({"success": True, "message": "Listing deleted successfully!"})


# ── Image Upload ──────────────────────────────────────────────────

@app.route("/api/upload", methods=["POST"])
def upload_images():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    if "images" not in request.files:
        return jsonify({"success": False, "message": "No images provided"}), 400

    saved = []
    for f in request.files.getlist("images"):
        if f and allowed_file(f.filename):
            ext = secure_filename(f.filename).rsplit(".", 1)[1].lower()
            filename = f"{uuid.uuid4().hex[:12]}.{ext}"
            f.save(os.path.join(UPLOAD_FOLDER, filename))
            saved.append(filename)
    return jsonify({"success": True, "filenames": saved})


# ── My Listings ───────────────────────────────────────────────────

@app.route("/api/my-listings", methods=["GET"])
def my_listings():
    user = _get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM listings WHERE owner_id=? ORDER BY created_at DESC", (user["id"],)
        ).fetchall()
    finally:
        db.close()

    listings = []
    for r in rows:
        d = dict(r)
        d["amenities"] = json.loads(d["amenities"])
        d["images"] = json.loads(d.get("images", "[]") or "[]")
        listings.append(d)
    return jsonify({"success": True, "listings": listings})


# ── Entry Point ───────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    logger.info("Flatifigo backend starting on port %d", Config.PORT)
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
