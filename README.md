# 🚀 TaskFlow — AI-Powered Task Management System

<div align="center">

![TaskFlow](https://img.shields.io/badge/TaskFlow-AI%20Powered-6366F1?style=for-the-badge&logo=lightning&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)

**A modern, production-ready task management platform with AI-powered priority suggestions, ML completion predictions, and a beautiful dark-themed Kanban board.**

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Auth** | Secure register/login with bcrypt password hashing |
| 📁 **Projects** | Full CRUD with status tracking and progress bars |
| ✅ **Kanban Board** | Drag-and-drop tasks across Todo → In Progress → Done |
| 🤖 **AI Priority** | Gemini API suggests task priority with reasoning |
| 📊 **ML Prediction** | Linear Regression predicts task completion time |
| 📈 **Dashboard** | KPI cards, Recharts bar/pie charts, activity feed |
| 🎨 **Dark UI** | Glassmorphism, gradients, micro-animations |
| 📱 **Responsive** | Mobile-first with collapsible sidebar |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + React Router DOM
- **Tailwind CSS 3.4** — dark theme design system
- **Recharts** — interactive charts
- **@hello-pangea/dnd** — drag-and-drop
- **Lucide React** — icons
- **Axios** — HTTP client

### Backend
- **Python 3.11+** + FastAPI
- **SQLAlchemy 2.0** — ORM
- **PostgreSQL** (Supabase) / SQLite fallback
- **JWT** (python-jose) + **bcrypt** (passlib)
- **Gemini API** — AI task priority
- **NumPy** — ML linear regression

---

## 📂 Project Structure

```
taskflow/
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── api.js                  # Axios instance + interceptors
│   │   ├── App.jsx                 # Routes + auth guards
│   │   ├── index.js                # Entry point
│   │   ├── index.css               # Tailwind + custom CSS
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Auth state management
│   │   │   └── ToastContext.jsx    # Toast notifications
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Sidebar + content wrapper
│   │   │   ├── Navbar.jsx          # Sidebar navigation
│   │   │   ├── Chart.jsx           # Recharts components
│   │   │   ├── ProjectCard.jsx     # Project card component
│   │   │   └── TaskCard.jsx        # Draggable task card
│   │   └── pages/
│   │       ├── Login.jsx           # Login page
│   │       ├── Register.jsx        # Registration page
│   │       ├── Dashboard.jsx       # KPI + charts + activity
│   │       ├── Projects.jsx        # Project CRUD + grid
│   │       └── Tasks.jsx           # Kanban board
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
├── backend/
│   ├── main.py                     # FastAPI app + AI/ML endpoints
│   ├── database.py                 # SQLAlchemy engine + session
│   ├── models.py                   # User, Project, Task models
│   ├── schemas.py                  # Pydantic request/response
│   ├── auth.py                     # JWT + bcrypt utilities
│   ├── routes/
│   │   ├── auth.py                 # POST /auth/register, /auth/login
│   │   ├── projects.py             # CRUD /projects
│   │   └── tasks.py                # CRUD /tasks
│   ├── ml/
│   │   └── predictor.py            # Linear regression predictor
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or use SQLite for local dev)

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env with your DATABASE_URL, SECRET_KEY, GEMINI_API_KEY

# Run server
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm start
```

### 3. Open App
Navigate to **http://localhost:3000** and register a new account!

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, get JWT token |
| `GET` | `/projects` | List user's projects |
| `POST` | `/projects` | Create project |
| `PUT` | `/projects/{id}` | Update project |
| `DELETE` | `/projects/{id}` | Delete project + tasks |
| `GET` | `/tasks/{project_id}` | List project tasks |
| `GET` | `/tasks/all` | List all user tasks |
| `POST` | `/tasks` | Create task |
| `PUT` | `/tasks/{id}` | Update task (drag & drop) |
| `DELETE` | `/tasks/{id}` | Delete task |
| `POST` | `/ai/suggest-priority` | AI priority suggestion |
| `POST` | `/ml/predict-time` | ML completion prediction |

---

## 🌐 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set root directory: `frontend`
4. Add env var: `REACT_APP_API_URL` = your Render backend URL

### Backend → Render
1. Create new Web Service on [Render](https://render.com)
2. Set root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add env vars: `DATABASE_URL`, `SECRET_KEY`, `GEMINI_API_KEY`

### Database → Supabase
1. Create project on [Supabase](https://supabase.com)
2. Go to Settings → Database → Connection string (URI)
3. Use that as `DATABASE_URL` in Render

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#6366F1` | Buttons, active states |
| Secondary | `#8B5CF6` | AI features, accents |
| Accent | `#06B6D4` | ML features, highlights |
| Background | `#0F172A` | Page background |
| Card | `#1E293B` | Card surfaces |
| Border | `#334155` | Dividers, borders |
| Text Primary | `#F1F5F9` | Headings, body |
| Text Secondary | `#94A3B8` | Labels, captions |

---

## 📜 License

MIT © TaskFlow
