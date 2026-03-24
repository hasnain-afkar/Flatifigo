"""
Flatifigo Backend — Flask + SQLite
Handles: auth, profiles, listings, search
"""

import os, json, hashlib, uuid, sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

DB_PATH = os.path.join(os.path.dirname(__file__), 'flatifigo.db')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ── Database Setup ──
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    db = get_db()
    db.executescript('''
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
    ''')
    # Migration: add images column if it doesn't exist yet
    try:
        db.execute("SELECT images FROM listings LIMIT 1")
    except sqlite3.OperationalError:
        db.execute("ALTER TABLE listings ADD COLUMN images TEXT DEFAULT '[]'")
    # Migration: add status column if it doesn't exist yet
    try:
        db.execute("SELECT status FROM listings LIMIT 1")
    except sqlite3.OperationalError:
        db.execute("ALTER TABLE listings ADD COLUMN status TEXT DEFAULT 'available'")
    # Migration: add avatar column to profiles if it doesn't exist
    try:
        db.execute("SELECT avatar FROM profiles LIMIT 1")
    except sqlite3.OperationalError:
        db.execute("ALTER TABLE profiles ADD COLUMN avatar TEXT DEFAULT ''")
    # Seed sample listings if empty
    count = db.execute("SELECT COUNT(*) FROM listings").fetchone()[0]
    if count == 0:
        seed_listings(db)
    db.commit()
    db.close()

def seed_listings(db):
    samples = [
        ("listing_s1","Spacious 2-Bedroom Flat near FAST University","A well-furnished 2-bedroom flat in H-13, Islamabad. Perfect for FAST or NUST students. Walking distance to main road.",12000,"islamabad","H-13",2,'["wifi","furnished","parking","security"]', '["1.jpg.jpeg"]', "Ahmed Khan","0300-1234567","sample_1","Ahmed Khan",127),
        ("listing_s2","Cozy Single Room in Shared Flat - Bahria Town","One furnished room in a 3-bedroom shared flat at Bahria Town Phase 4. AC installed, shared kitchen.",8000,"islamabad","Bahria Town Phase 4",1,'["wifi","furnished","ac","kitchen"]', '["2.jpg.jpeg"]', "Hassan Ali","0312-9876543","sample_2","Hassan Ali",89),
        ("listing_s3","Budget-Friendly Room near UET Lahore","Affordable single room in GT Road area near UET Lahore. Basic furniture provided. Utilities included.",5500,"lahore","GT Road, Near UET",1,'["furnished","utilities"]', '[]', "Usman Tariq","0321-5551234","sample_3","Usman Tariq",56),
        ("listing_s4","Premium 3-Bedroom Apartment - F-10 Islamabad","Luxurious 3-bedroom apartment in F-10 Markaz. Fully furnished with modern kitchen, lounge, and balcony.",25000,"islamabad","F-10 Markaz",3,'["wifi","furnished","ac","kitchen","parking","laundry","security"]', '[]', "Shahid Mahmood","0333-4445566","sample_4","Shahid Mahmood",203),
        ("listing_s5","Shared Room for Students - Rawalpindi Saddar","Shared room available near Saddar, Rawalpindi. Close to Murree Road bus stops. Ideal for male students.",4000,"rawalpindi","Saddar",1,'["utilities","kitchen"]', '[]', "Bilal Shahzad","0345-6667788","sample_5","Bilal Shahzad",42),
        ("listing_s6","Modern Studio Apartment - DHA Lahore","Newly renovated studio apartment in DHA Phase 5. Fully furnished with AC. Perfect for single professionals.",18000,"lahore","DHA Phase 5",1,'["wifi","furnished","ac","kitchen","security","parking"]', '[]', "Rehan Aslam","0300-9998877","sample_6","Rehan Aslam",164),
    ]
    for s in samples:
        # Tuple order: id, title, description, rent, city, area, rooms, amenities, images, contact_name, contact_phone, owner_id, owner_name, views
        # Columns: id, title, description, rent, city, area, rooms, amenities, images, status, contact_name, contact_phone, owner_id, owner_name, views, created_at
        db.execute("INSERT INTO listings (id,title,description,rent,city,area,rooms,amenities,images,status,contact_name,contact_phone,owner_id,owner_name,views,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], 'available', s[9], s[10], s[11], s[12], s[13], datetime.utcnow().isoformat()))

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# In-memory sessions (simple approach)
sessions = {}

def create_session(user):
    token = str(uuid.uuid4())
    sessions[token] = {"id": user["id"], "fullName": user["full_name"], "email": user["email"], "role": user["role"]}
    return token

def get_session(token):
    return sessions.get(token)

# ── Serve Frontend ──
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ── Auth Routes ──
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('fullName','').strip()
    email = data.get('email','').strip().lower()
    password = data.get('password','')
    confirm = data.get('confirmPassword','')
    role = data.get('role','')

    if not all([name, email, password, confirm, role]):
        return jsonify({"success": False, "message": "All fields are required."}), 400
    if len(name) < 2:
        return jsonify({"success": False, "message": "Name must be at least 2 characters."}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters."}), 400
    if password != confirm:
        return jsonify({"success": False, "message": "Passwords do not match."}), 400

    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if existing:
        db.close()
        return jsonify({"success": False, "message": "An account with this email already exists."}), 409

    user_id = "user_" + str(uuid.uuid4())[:8]
    db.execute("INSERT INTO users (id, full_name, email, password_hash, role, created_at) VALUES (?,?,?,?,?,?)",
        (user_id, name, email, hash_password(password), role, datetime.utcnow().isoformat()))
    db.execute("INSERT INTO profiles (user_id) VALUES (?)", (user_id,))
    db.commit()

    user = {"id": user_id, "full_name": name, "email": email, "role": role}
    token = create_session(user)
    db.close()
    return jsonify({"success": True, "message": "Account created successfully!", "token": token,
        "user": {"id": user_id, "fullName": name, "email": email, "role": role}})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email','').strip().lower()
    password = data.get('password','')

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email=? AND password_hash=?", (email, hash_password(password))).fetchone()
    db.close()

    if not user:
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    token = create_session(dict(user))
    return jsonify({"success": True, "message": f"Welcome back, {user['full_name']}!",
        "token": token, "user": {"id": user["id"], "fullName": user["full_name"], "email": user["email"], "role": user["role"]}})

@app.route('/api/session', methods=['GET'])
def check_session():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if session:
        return jsonify({"loggedIn": True, "user": session})
    return jsonify({"loggedIn": False})

@app.route('/api/logout', methods=['POST'])
def logout():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    sessions.pop(token, None)
    return jsonify({"success": True})

# ── Profile Routes ──
@app.route('/api/profile', methods=['GET'])
def get_profile():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    db = get_db()
    profile = db.execute("SELECT * FROM profiles WHERE user_id=?", (session["id"],)).fetchone()
    db.close()
    if profile:
        return jsonify({"success": True, "profile": dict(profile)})
    return jsonify({"success": True, "profile": {}})

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.json
    db = get_db()
    db.execute('''UPDATE profiles SET occupation=?, gender_preference=?, bio=?, budget_min=?,
        budget_max=?, preferred_city=?, preferred_area=?, lifestyle=?, schedule=?, updated_at=?
        WHERE user_id=?''',
        (data.get('occupation',''), data.get('genderPreference',''), data.get('bio',''),
         data.get('budgetMin',0), data.get('budgetMax',0), data.get('preferredCity',''),
         data.get('preferredArea',''), data.get('lifestyle',''), data.get('schedule',''),
         datetime.utcnow().isoformat(), session["id"]))
    db.commit()
    db.close()
    return jsonify({"success": True, "message": "Profile updated successfully!"})

@app.route('/api/roommates', methods=['GET'])
def get_roommates():
    db = get_db()
    rows = db.execute('''
        SELECT u.id, u.full_name, u.role, p.occupation, p.gender_preference, p.bio, 
               p.budget_min, p.budget_max, p.preferred_city, p.preferred_area, p.avatar
        FROM users u 
        JOIN profiles p ON u.id = p.user_id
        WHERE u.role != 'owner'
    ''').fetchall()
    db.close()
    
    roommates = [dict(r) for r in rows]
    return jsonify({"success": True, "roommates": roommates})

@app.route('/api/profile/avatar', methods=['POST'])
def upload_avatar():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    if 'avatar' not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400

    f = request.files['avatar']
    if f and allowed_file(f.filename):
        ext = f.filename.rsplit('.', 1)[1].lower()
        filename = f"avatar_{session['id']}_{uuid.uuid4().hex[:6]}.{ext}"
        f.save(os.path.join(UPLOAD_FOLDER, filename))
        db = get_db()
        # Delete old avatar file
        old = db.execute("SELECT avatar FROM profiles WHERE user_id=?", (session['id'],)).fetchone()
        if old and old['avatar']:
            old_path = os.path.join(UPLOAD_FOLDER, old['avatar'])
            if os.path.exists(old_path):
                os.remove(old_path)
        db.execute("UPDATE profiles SET avatar=? WHERE user_id=?", (filename, session['id']))
        db.commit()
        db.close()
        return jsonify({"success": True, "filename": filename, "message": "Avatar updated!"})
    return jsonify({"success": False, "message": "Invalid file type"}), 400

@app.route('/api/profile/avatar', methods=['DELETE'])
def delete_avatar():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    db = get_db()
    old = db.execute("SELECT avatar FROM profiles WHERE user_id=?", (session['id'],)).fetchone()
    if old and old['avatar']:
        old_path = os.path.join(UPLOAD_FOLDER, old['avatar'])
        if os.path.exists(old_path):
            os.remove(old_path)
    db.execute("UPDATE profiles SET avatar='' WHERE user_id=?", (session['id'],))
    db.commit()
    db.close()
    return jsonify({"success": True, "message": "Avatar removed!"})

# ── Listing Routes ──
@app.route('/api/listings', methods=['GET'])
def get_listings():
    db = get_db()
    query = request.args.get('q','').lower()
    city = request.args.get('city','')
    min_rent = request.args.get('minRent','')
    max_rent = request.args.get('maxRent','')
    rooms = request.args.get('rooms','')

    sql = "SELECT * FROM listings WHERE 1=1"
    params = []
    if query:
        sql += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(area) LIKE ? OR LOWER(city) LIKE ?)"
        params.extend([f"%{query}%"]*4)
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
    rows = db.execute(sql, params).fetchall()
    db.close()

    listings = []
    for r in rows:
        d = dict(r)
        d['amenities'] = json.loads(d['amenities'])
        d['images'] = json.loads(d.get('images', '[]') or '[]')
        listings.append(d)
    return jsonify({"success": True, "listings": listings})

@app.route('/api/listings', methods=['POST'])
def create_listing():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.json
    title = data.get('title','').strip()
    desc = data.get('description','').strip()
    rent = data.get('rent',0)
    city = data.get('city','')
    area = data.get('area','').strip()
    rooms = data.get('rooms',0)
    amenities = json.dumps(data.get('amenities',[]))
    images = json.dumps(data.get('images',[]))
    contact_name = data.get('contactName','').strip()
    contact_phone = data.get('contactPhone','').strip()

    if not all([title, desc, rent, city, area, rooms]):
        return jsonify({"success": False, "message": "Please fill in all required fields."}), 400

    listing_id = "listing_" + str(uuid.uuid4())[:8]
    db = get_db()
    db.execute("INSERT INTO listings (id,title,description,rent,city,area,rooms,amenities,images,status,contact_name,contact_phone,owner_id,owner_name,views,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (listing_id, title, desc, int(rent), city, area, int(rooms), amenities, images, 'available', contact_name, contact_phone,
         session["id"], session["fullName"], 0, datetime.utcnow().isoformat()))
    db.commit()
    db.close()
    return jsonify({"success": True, "message": "Listing published successfully!", "id": listing_id})

@app.route('/api/listings/<listing_id>', methods=['GET'])
def get_listing(listing_id):
    db = get_db()
    row = db.execute("SELECT * FROM listings WHERE id=?", (listing_id,)).fetchone()
    if row:
        db.execute("UPDATE listings SET views=views+1 WHERE id=?", (listing_id,))
        db.commit()
    db.close()
    if not row:
        return jsonify({"success": False, "message": "Listing not found"}), 404
    d = dict(row)
    d['amenities'] = json.loads(d['amenities'])
    d['images'] = json.loads(d.get('images', '[]') or '[]')
    return jsonify({"success": True, "listing": d})

# ── Image Upload ──
@app.route('/api/upload', methods=['POST'])
def upload_images():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    if 'images' not in request.files:
        return jsonify({"success": False, "message": "No images provided"}), 400

    files = request.files.getlist('images')
    saved = []
    for f in files:
        if f and allowed_file(f.filename):
            ext = f.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex[:12]}.{ext}"
            f.save(os.path.join(UPLOAD_FOLDER, filename))
            saved.append(filename)
    return jsonify({"success": True, "filenames": saved})

# ── My Listings ──
@app.route('/api/my-listings', methods=['GET'])
def my_listings():
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    db = get_db()
    rows = db.execute("SELECT * FROM listings WHERE owner_id=? ORDER BY created_at DESC", (session["id"],)).fetchall()
    db.close()
    listings = []
    for r in rows:
        d = dict(r)
        d['amenities'] = json.loads(d['amenities'])
        d['images'] = json.loads(d.get('images', '[]') or '[]')
        listings.append(d)
    return jsonify({"success": True, "listings": listings})

# ── Update Listing ──
@app.route('/api/listings/<listing_id>', methods=['PUT'])
def update_listing(listing_id):
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    db = get_db()
    existing = db.execute("SELECT * FROM listings WHERE id=? AND owner_id=?", (listing_id, session["id"])).fetchone()
    if not existing:
        db.close()
        return jsonify({"success": False, "message": "Listing not found or not authorized"}), 404
    data = request.json
    db.execute('''UPDATE listings SET title=?, description=?, rent=?, city=?, area=?, rooms=?,
        amenities=?, images=?, status=?, contact_name=?, contact_phone=? WHERE id=? AND owner_id=?''',
        (data.get('title',''), data.get('description',''), int(data.get('rent',0)),
         data.get('city',''), data.get('area',''), int(data.get('rooms',0)),
         json.dumps(data.get('amenities',[])), json.dumps(data.get('images',[])),
         data.get('status','available'),
         data.get('contactName',''), data.get('contactPhone',''),
         listing_id, session["id"]))
    db.commit()
    db.close()
    return jsonify({"success": True, "message": "Listing updated successfully!"})

# ── Delete Listing ──
@app.route('/api/listings/<listing_id>', methods=['DELETE'])
def delete_listing(listing_id):
    token = request.headers.get('Authorization','').replace('Bearer ','')
    session = get_session(token)
    if not session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    db = get_db()
    existing = db.execute("SELECT * FROM listings WHERE id=? AND owner_id=?", (listing_id, session["id"])).fetchone()
    if not existing:
        db.close()
        return jsonify({"success": False, "message": "Listing not found or not authorized"}), 404
    # Delete associated images
    images = json.loads(existing['images'] or '[]')
    for img in images:
        path = os.path.join(UPLOAD_FOLDER, img)
        if os.path.exists(path):
            os.remove(path)
    db.execute("DELETE FROM listings WHERE id=? AND owner_id=?", (listing_id, session["id"]))
    db.commit()
    db.close()
    return jsonify({"success": True, "message": "Listing deleted successfully!"})

if __name__ == '__main__':
    init_db()
    print("Flatifigo backend running at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
