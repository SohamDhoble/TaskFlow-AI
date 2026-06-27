# 🚀 TaskFlow AI — AI-Powered Task Management System

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge\&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge\&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge\&logo=postgresql)
![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge\&logo=railway)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge\&logo=vercel)
![Ollama](https://img.shields.io/badge/AI-Ollama-111111?style=for-the-badge)

# 📋 TaskFlow AI

### A Modern AI-Powered Task Management System

Secure task management platform with **JWT Authentication**, **Project Management**, **Kanban Board**, and **AI-powered Task Priority Suggestions using Ollama**.

---

# 🌐 Live Demo

### 🔗 Frontend

https://task-flow-ai-gamma.vercel.app

### ⚙️ Backend API

https://taskflow-ai-production-eae9.up.railway.app

### 📚 Swagger Documentation

https://taskflow-ai-production-eae9.up.railway.app/docs

---

# 🏗 System Architecture

```
                React Frontend
                  (Vercel)
                     │
                     ▼
            FastAPI Backend
                (Railway)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
 PostgreSQL Database        Ollama AI
    (Supabase)            (Local Demo)
```

---

# ✨ Features

## 🔐 Authentication

* JWT Authentication
* User Registration
* User Login
* Password Hashing (bcrypt)
* Protected Routes
* Secure API Access

---

## 📁 Project Management

* Create Project
* View Projects
* Update Project
* Delete Project
* Project Status
* Project Progress

---

## ✅ Task Management

* Create Task
* Update Task
* Delete Task
* Task Priority
* Task Status
* Task Description

---

## 🤖 AI Features

* AI Priority Suggestion
* Ollama Integration
* Llama 3.2 Model
* AI Reason Generation

> **Note:** AI suggestions are available in the local demo where Ollama is running. The deployed production version focuses on core task management functionality.

---

## 📊 Dashboard

* Total Projects
* Total Tasks
* Pending Tasks
* Completed Tasks
* Statistics

---

## 🎨 UI Features

* Responsive Design
* Modern Interface
* Mobile Friendly
* Toast Notifications
* Loading States

---

# 🛠 Tech Stack

## Frontend

* React 18
* React Router DOM
* Axios
* JavaScript (ES6)
* HTML5
* CSS3
* React Hot Toast

---

## Backend

* Python 3.12
* FastAPI
* Uvicorn
* SQLAlchemy
* Pydantic
* Passlib
* bcrypt
* python-jose (JWT)
* python-dotenv
* python-multipart
* HTTPX

---

## Database

* PostgreSQL
* Supabase

---

## AI

* Ollama
* Llama 3.2

---

## Deployment

* Git
* GitHub
* Railway
* Vercel

---

# 📂 Project Structure

```
TaskFlow-AI
│
├── backend
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── routes
│   │     ├── auth.py
│   │     ├── projects.py
│   │     └── tasks.py
│   └── ...
│
├── frontend
│   ├── public
│   ├── src
│   │     ├── components
│   │     ├── pages
│   │     ├── App.js
│   │     └── ...
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/SohamDhoble/TaskFlow-AI.git

cd TaskFlow-AI
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

# 🔑 Environment Variables

## Backend (.env)

```
DATABASE_URL=your_database_url

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# 🤖 Ollama Setup

Install Ollama

```
https://ollama.com
```

Pull Llama 3.2

```bash
ollama pull llama3.2
```

Run

```bash
ollama serve
```

---

# 📡 API Endpoints

## Authentication

```
POST /auth/register

POST /auth/login
```

## Projects

```
GET /projects

POST /projects

PUT /projects/{id}

DELETE /projects/{id}
```

## Tasks

```
GET /tasks

POST /tasks

PUT /tasks/{id}

DELETE /tasks/{id}
```

## AI

```
POST /ai/suggest-priority
# 🔒 Security

* JWT Authentication
* Password Hashing
* Protected Routes
* CORS Configuration
* Environment Variables
* SQLAlchemy ORM

---

# 🚀 Deployment

## Frontend

* Vercel

## Backend

* Railway

## Database

* Supabase

---

# 🔮 Future Improvements

* Email Verification
* Password Reset
* Team Collaboration
* File Attachments
* Notifications
* Calendar View
* Dark / Light Theme
* Docker Support
* CI/CD Pipeline
* Role Based Access
* AI Chat Assistant
* AI Task Summarizer

---

# 👨‍💻 Author

**Soham Dhoble**

GitHub:
https://github.com/SohamDhoble

Project:
https://github.com/SohamDhoble/TaskFlow-AI

---

# ⭐ Support

If you like this project,

⭐ Star the repository

🍴 Fork it

🛠 Contribute

---

# 📄 License

This project is licensed under the MIT License.
