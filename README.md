# 🏠 Flatifigo — Find Your Perfect Flat & Roommate

Flatifigo is a web-based platform designed for **students and jobholders** in Pakistan to find shared flats and compatible roommates. Built with a **Flask + SQLite** backend and a vanilla **HTML / CSS / JavaScript** frontend.

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

| Layer    | Technology              |
| -------- | ----------------------- |
| Backend  | Python Flask            |
| Database | SQLite                  |
| Frontend | HTML, CSS, JavaScript   |
| CORS     | Flask-CORS              |

---

## 📋 Prerequisites

Make sure you have the following installed:

- **Python 3.8+** — [Download Python](https://www.python.org/downloads/)
- **pip** — Comes bundled with Python

---

## 🚀 Getting Started

### 1. Clone or Download the Project

```bash
cd i242611_iteration1
```

### 2. Install Dependencies

```bash
pip install flask flask-cors
```

### 3. Run the Server

```bash
python server.py
```

The server will start at **http://localhost:5000**. Open this URL in your browser.

> [!NOTE]
> On first run, the database (`flatifigo.db`) is auto-created and seeded with 6 sample listings so the app doesn't feel empty.

---

## 📁 Project Structure

```
i242611_iteration1/
├── server.py          # Flask backend (API routes, DB setup, auth)
├── index.html         # Main HTML entry point (SPA shell)
├── flatifigo.db       # SQLite database (auto-generated)
├── css/
│   └── styles.css     # All styling
├── js/
│   ├── api.js         # API helper (fetch wrapper with auth headers)
│   ├── app.js         # SPA router and page rendering
│   ├── auth.js        # Login / Register logic
│   ├── profile.js     # Profile management
│   ├── listings.js    # Listing CRUD (create, read, update, delete)
│   ├── search.js      # Search & filter logic
│   ├── roommates.js   # Roommate matching
│   └── messages.js    # Messaging feature
├── uploads/           # Uploaded images (avatars, listing photos)
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| POST   | `/api/register`  | Create a new account   |
| POST   | `/api/login`     | Log in                 |
| GET    | `/api/session`   | Check current session  |
| POST   | `/api/logout`    | Log out                |

### Profile
| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | `/api/profile`        | Get current user profile |
| PUT    | `/api/profile`        | Update profile           |
| POST   | `/api/profile/avatar` | Upload avatar            |
| DELETE | `/api/profile/avatar` | Remove avatar            |

### Listings
| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/listings`           | Browse/search listings   |
| POST   | `/api/listings`           | Create a new listing     |
| GET    | `/api/listings/<id>`      | Get listing details      |
| PUT    | `/api/listings/<id>`      | Update a listing         |
| DELETE | `/api/listings/<id>`      | Delete a listing         |
| GET    | `/api/my-listings`        | Get current user listings|

### Other
| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| POST   | `/api/upload`    | Upload listing images    |
| GET    | `/api/roommates` | Get all roommate profiles|

---

## 👥 User Roles

| Role             | Permissions                                          |
| ---------------- | ---------------------------------------------------- |
| **Student**      | Browse flats, set profile, search roommates          |
| **Jobholder**    | Browse flats, set profile, search roommates          |
| **Property Owner** | All of the above + Post, edit, and delete listings |

---

## ⚙️ Configuration

| Setting          | Default      | Location        |
| ---------------- | ------------ | --------------- |
| Server Port      | `5000`       | `server.py`     |
| Max Upload Size  | `16 MB`      | `server.py`     |
| Database Path    | `flatifigo.db` | `server.py`   |
| Upload Directory | `uploads/`   | `server.py`     |
| Allowed Images   | png, jpg, jpeg, gif, webp | `server.py` |

---

## 📝 Notes

- The app uses **in-memory sessions**, so all users will be logged out when the server restarts.
- Passwords are hashed using **SHA-256** before being stored in the database.
- The frontend is a **Single Page Application (SPA)** — all routing is handled client-side via hash-based navigation.
