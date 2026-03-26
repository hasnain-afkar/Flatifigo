# 🏠 Flatifigo — Find Your Perfect Flat & Roommate

Flatifigo is a web-based platform designed for **students and jobholders** in Pakistan to find shared flats and compatible roommates. Built with a **Flask + SQLite/PostgreSQL** backend and a vanilla **HTML / CSS / JavaScript** frontend.

---

## ✨ Features

- **User Authentication** — Register and log in with role-based access (Student, Jobholder, Property Owner)
- **Browse Flats** — Search and filter flat listings by city, rent range, rooms, and keywords
- **Post Listings** — Property owners can create, edit, and delete flat listings with images
- **My Listings** — Dashboard for owners to manage their published listings
- **User Profiles** — Set preferences like budget, city, lifestyle, schedule, and a profile avatar
- **Roommate Matching** — Browse potential roommates and find compatible matches
- **Messaging** — In-app messaging to connect with other users
- **Image Uploads** — Upload listing images and profile avatars (PNG, JPG, JPEG, GIF, WEBP)

---

## 🛠️ Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Backend    | Python Flask + Gunicorn              |
| Database   | SQLite (dev) / PostgreSQL (prod)     |
| Auth       | JWT tokens + bcrypt password hashing |
| Migrations | Alembic                              |
| Frontend   | HTML, CSS, JavaScript                |
| CORS       | Flask-CORS                           |

---

## 📋 Prerequisites

- **Python 3.12+** — [Download Python](https://www.python.org/downloads/)
- **pip** — Comes bundled with Python

---

## 🚀 Getting Started (Local Development)

### 1. Clone the project

```bash
git clone https://github.com/hasnain-afkar/Flatifigo.git
cd Flatifigo
```

### 2. Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum, set a strong SECRET_KEY
```

### 5. Run the development server

```bash
python server.py
```

Open **http://localhost:5000** in your browser.

> **Note:** On first run, the database (`flatifigo.db`) is auto-created and seeded with 6 sample listings.

---

## 🔑 Environment Variables

| Variable             | Default                   | Description                                          |
| -------------------- | ------------------------- | ---------------------------------------------------- |
| `SECRET_KEY`         | `change-me-in-production` | JWT signing key — **must** be changed in production  |
| `JWT_EXPIRY_HOURS`   | `24`                      | How long a JWT token is valid                        |
| `DATABASE_URL`       | `sqlite:///flatifigo.db`  | Database connection string                           |
| `PORT`               | `5000`                    | Port the server listens on                           |
| `DEBUG`              | `false`                   | Enable Flask debug mode (dev only)                   |
| `CORS_ORIGINS`       | `*`                       | Comma-separated allowed origins, or `*`              |
| `UPLOAD_FOLDER`      | `uploads`                 | Path to uploaded-file storage                        |
| `MAX_CONTENT_LENGTH` | `16777216`                | Max upload size in bytes (default 16 MB)             |

---

## 🗄️ Database Migrations (Alembic)

```bash
# Apply all pending migrations
python -m alembic upgrade head

# Create a new migration after changing the schema
python -m alembic revision --autogenerate -m "describe_change"

# Roll back one revision
python -m alembic downgrade -1
```

---

## 🐳 Docker

### Quick start

```bash
docker-compose up --build
```

The app will be available at **http://localhost:5000**.

### Production Docker run

```bash
docker build -t flatifigo .
docker run -d \
  -p 5000:5000 \
  -e SECRET_KEY=your-secret-key \
  -e DATABASE_URL=postgresql://user:pass@host:5432/flatifigo \
  -v flatifigo_uploads:/app/uploads \
  flatifigo
```

---

## ☁️ Deployment Guide

### Railway.app

1. Push the repository to GitHub.
2. Create a new Railway project → **Deploy from GitHub repo**.
3. Add environment variables in the Railway dashboard:
   - `SECRET_KEY` (generate with `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `DATABASE_URL` (Railway auto-provisions PostgreSQL — copy the connection string)
   - `PORT` is set automatically by Railway.
4. Railway will automatically detect the `Procfile` and run Gunicorn.

### Render.com

1. Create a new **Web Service** and connect your GitHub repo.
2. Set **Build Command**: `pip install -r requirements.txt`
3. Set **Start Command**: `gunicorn wsgi:application`
4. Add environment variables under **Environment**.

### Heroku

```bash
heroku create flatifigo-app
heroku config:set SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
heroku addons:create heroku-postgresql:mini
git push heroku main
```

### AWS / DigitalOcean VPS

```bash
# On your server
git clone https://github.com/hasnain-afkar/Flatifigo.git
cd Flatifigo
cp .env.example .env   # fill in production values
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:5000 --workers 4 wsgi:application
```

Use **nginx** as a reverse proxy and **systemd** or **supervisord** to keep the process running.

### Google Cloud Run / Azure App Service

Build and push the Docker image, then deploy using your platform's container service.
Set environment variables via the platform console.

---

## 📁 Project Structure

```
Flatifigo/
├── server.py            # Flask application (routes, auth, DB)
├── wsgi.py              # Gunicorn entry point
├── config.py            # Environment-based configuration
├── requirements.txt     # Python dependencies
├── Procfile             # Platform deployment config
├── Dockerfile           # Container image
├── docker-compose.yml   # Local Docker development
├── .dockerignore        # Docker build exclusions
├── .env.example         # Environment variable template
├── runtime.txt          # Python version specification
├── alembic.ini          # Alembic configuration
├── alembic/             # Database migrations
│   └── versions/
│       └── 001_initial_schema.py
├── index.html           # SPA shell
├── css/
│   └── styles.css
├── js/
│   ├── api.js           # API helper (uses relative URLs)
│   ├── app.js
│   ├── auth.js
│   ├── profile.js
│   ├── listings.js
│   ├── search.js
│   ├── roommates.js
│   └── messages.js
└── uploads/             # Uploaded images (auto-created)
```

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint        | Description           |
| ------ | --------------- | --------------------- |
| POST   | `/api/register` | Create a new account  |
| POST   | `/api/login`    | Log in                |
| GET    | `/api/session`  | Check current session |
| POST   | `/api/logout`   | Log out               |

### Profile

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | `/api/profile`        | Get current user profile |
| PUT    | `/api/profile`        | Update profile           |
| POST   | `/api/profile/avatar` | Upload avatar            |
| DELETE | `/api/profile/avatar` | Remove avatar            |

### Listings

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| GET    | `/api/listings`      | Browse/search listings    |
| POST   | `/api/listings`      | Create a new listing      |
| GET    | `/api/listings/<id>` | Get listing details       |
| PUT    | `/api/listings/<id>` | Update a listing          |
| DELETE | `/api/listings/<id>` | Delete a listing          |
| GET    | `/api/my-listings`   | Get current user listings |

### Other

| Method | Endpoint         | Description               |
| ------ | ---------------- | ------------------------- |
| POST   | `/api/upload`    | Upload listing images     |
| GET    | `/api/roommates` | Get all roommate profiles |
| GET    | `/health`        | Health check              |

---

## 👥 User Roles

| Role                 | Permissions                                        |
| -------------------- | -------------------------------------------------- |
| **Student**          | Browse flats, set profile, search roommates        |
| **Jobholder**        | Browse flats, set profile, search roommates        |
| **Property Owner**   | All of the above + Post, edit, and delete listings |

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (replaces the original SHA-256).
- Authentication uses **JWT tokens** stored in `localStorage`. Tokens expire after `JWT_EXPIRY_HOURS` (default 24 h).
- Always set a strong, unique `SECRET_KEY` in production.
- Set `DEBUG=false` in production.
- Restrict `CORS_ORIGINS` to your frontend domain in production.

---

## 🛠️ Troubleshooting

| Problem                              | Solution                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| `ModuleNotFoundError`                | Run `pip install -r requirements.txt`                           |
| Port already in use                  | Set `PORT=5001` in `.env`                                       |
| Database locked                      | Stop other processes accessing `flatifigo.db`                   |
| 401 Unauthorized after server restart | Expected — JWT tokens survive restarts (stateless auth)        |
| CORS errors                          | Set `CORS_ORIGINS` to your frontend URL                         |
