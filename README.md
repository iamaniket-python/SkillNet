# SkillNet

A full-stack **LinkedIn clone** built with the MERN-inspired stack — React on the frontend, Express/Node on the backend, but with **PostgreSQL** instead of MongoDB.

🔗 **Live:** [https://skillnet-rosy.vercel.app](https://skillnet-rosy.vercel.app)
🔗 **API:** [https://skillnet-4gib.onrender.com](https://skillnet-4gib.onrender.com)

---

## ✨ Features

- **Authentication** — JWT-based login/register, protected routes
- **Posts / Feed** — create posts with image upload, like, comment (edit/delete)
- **Connections** — send/accept/reject connection requests, suggestions
- **Profile**
  - Header with photo & banner upload
  - Edit profile modal
  - Analytics card
  - Activity card
  - Experience (CRUD)
  - Education (CRUD)
  - Licenses & Certificates (CRUD)
  - Projects (with GitHub / live demo links)
  - Skills (with endorsements)
- **Search & Discover** — search users, connect/message directly from results
- **Notifications** — real-time notification system
- **Messaging** — real-time 1:1 chat via Socket.io (online status, last seen, read receipts)
- **Security** — Helmet, rate limiting, CORS, input validation, error handling middleware

---

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- Plain CSS (no Tailwind)
- Redux (where applicable)
- Socket.io-client

**Backend**
- Node.js + Express
- PostgreSQL (raw SQL, no ORM)
- Socket.io (real-time messaging & notifications)
- JWT for authentication
- Multer + Cloudinary (image uploads)
- Helmet, express-rate-limit, compression, morgan

**Database & Hosting**
- Database: [Neon](https://neon.tech) (serverless Postgres)
- Backend: [Render](https://render.com)
- Frontend: [Vercel](https://vercel.com)
- Media storage: [Cloudinary](https://cloudinary.com)

**Testing**
- Jest + Supertest (backend API tests)
- Playwright (E2E — auth, posts, connections, messages flows)

---

## 📁 Project Structure

```
skillnet/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, cloudinary.js
│   │   ├── controllers/      # route handlers
│   │   ├── middleware/       # auth, upload, error handling
│   │   ├── routes/           # API route definitions
│   │   ├── socket/            # Socket.io setup
│   │   └── utils/
│   ├── app.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/          # AuthContext
    │   ├── css/               # stylesheets (kept separate from components)
    │   ├── pages/
    │   └── api/               # axios instance
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend (`.env`)

```env
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Client
CLIENT_URL=https://skillnet-rosy.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=https://skillnet-4gib.onrender.com/api
VITE_SOCKET_URL=https://skillnet-4gib.onrender.com
```

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repo
```bash
git clone https://github.com/iamaniket-python/SkillNet.git
cd SkillNet
```

### 2. Backend setup
```bash
cd backend
npm install
# create .env file (see above)
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
# create .env file (see above)
npm run dev
```

### 4. Database
- Create a PostgreSQL database (locally or via Neon)
- Run the schema migration script (`schema.sql` if available)
- Update `DATABASE_URL` accordingly

---

## 🧪 Running Tests

**Backend (Jest + Supertest)**
```bash
cd backend
npm test
```

**E2E (Playwright)**
```bash
cd frontend
npx playwright test
```

---

## 📦 Deployment

- **Backend** → Render (auto-deploys from `SkillNet` branch)
- **Frontend** → Vercel (auto-deploys from `SkillNet` branch)
- **Database** → Neon (serverless Postgres)
- **Media** → Cloudinary (uploads are stored here, not on local disk, since Render's filesystem is ephemeral)

---

## 👤 Author

**Aniket**
Full Stack Developer
GitHub: [@iamaniket-python](https://github.com/iamaniket-python)

---

## 📄 License

This project is for learning/portfolio purposes.
