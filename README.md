# Flatifigo

Flatifigo is a flat rental and roommate matching web app. The project has a static HTML/CSS/JavaScript frontend and a Node.js/Express backend connected to MongoDB.

## Project Structure

```text
.
+-- index.html              # Frontend entry point
+-- css/                    # Frontend styles
+-- js/                     # Frontend scripts
+-- uploads/                # Frontend/demo image assets
+-- backend/                # Express API server
|   +-- server.js
|   +-- package.json
|   +-- .env.example
|   +-- controllers/
|   +-- models/
|   +-- routes/
|   +-- uploads/
+-- Diagrams/               # Project diagrams
```

## Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB connection string
- A local static file server for the frontend, such as VS Code Live Server

## Backend Setup

1. Open a terminal in the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create the environment file:

```bash
copy .env.example .env
```

On macOS/Linux, use:

```bash
cp .env.example .env
```

4. Update `backend/.env` if needed:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/flatifigo
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://127.0.0.1:5500
MAX_FILE_UPLOADS=5
MAX_FILE_SIZE_MB=5
```

5. Start MongoDB.

If MongoDB is installed locally, make sure the MongoDB service is running before starting the backend.

6. Seed demo data, optional but recommended:

```bash
npm run seed
npm run seed:messages
```

7. Start the backend server:

```bash
npm run dev
```

For production-style startup, use:

```bash
npm start
```

The backend should run at:

```text
http://localhost:5000
```

You can check the API health route at:

```text
http://localhost:5000/api/health
```

## Frontend Setup

The frontend is served from the project root.

Recommended option using VS Code:

1. Open the project folder in VS Code.
2. Install the Live Server extension if it is not already installed.
3. Right-click `index.html`.
4. Select `Open with Live Server`.

The frontend usually opens at:

```text
http://127.0.0.1:5500
```

Alternative using Python from the project root:

```bash
python -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500
```

## Demo Login Details

After running the seed commands, the demo password for seeded users is:

```text
pass123
```

Example seeded accounts:

```text
admin@demo.com
ali.owner@demo.com
sara.owner@demo.com
hasnain@demo.com
talal@demo.com
humayl@demo.com
umer@demo.com
```

## Important Notes

- Keep the backend running while using the frontend.
- The frontend API base URL is set in `js/api.js` as `http://localhost:5000`.
- If you change the backend port, update `js/api.js` too.
- Uploaded backend files are stored in `backend/uploads`.
- The local MongoDB database name in the default config is `flatifigo`.

## Common Issues

### Network error in the frontend

Make sure the backend is running:

```bash
cd backend
npm run dev
```

### MongoDB connection failed

Check that MongoDB is running and that `MONGO_URI` in `backend/.env` is correct.

### Port already in use

Change the `PORT` value in `backend/.env`, then update `API_ORIGIN` in `js/api.js` to match the new backend URL.
