

# 💰 AI Budget Manager

A full-stack personal-finance app for tracking income and spending, visualizing it with charts and exportable reports, and getting **AI-generated insights** about your habits via the DeepSeek API.

**Live:** https://budget-manager-murex.vercel.app &nbsp;·&nbsp; **Stack:** Angular 19 · Express · PostgreSQL · DeepSeek AI

<!-- 👇 Add a screenshot or GIF here — drag an image into the GitHub editor and paste the link.
![Dashboard](docs/screenshot.png) -->
<img width="1920" height="1009" alt="budget_manager" src="https://github.com/user-attachments/assets/3ea66269-b50f-4d23-bd52-d642f04f79f4" />

## ✨ Features
- 📊 **Dashboard** with income/expense tracking and category breakdowns
- 📈 **Reports** with interactive charts (Chart.js) and **PDF export** (jsPDF)
- 🤖 **AI suggestions** — plain-language financial insights generated from your data via the DeepSeek API
- 🔐 **Secure auth** — JWT-based login/registration with bcrypt-hashed passwords
- 🗂️ Full CRUD for transactions and categories over a REST API
- 🔔 Inline feedback with toasts and loading states

## 🛠️ Tech Stack
**Frontend:** Angular 19 (TypeScript) · Chart.js / ng2-charts · jsPDF · ngx-toastr · RxJS — deployed on Vercel
**Backend:** Node.js · Express 5 · Sequelize ORM · JWT · bcrypt
**Database:** PostgreSQL (hosted on Neon)
**AI:** DeepSeek Chat API

## 🏗️ Architecture
```
Budget-Management.Frontend/   Angular SPA (pages: dashboard, transactions, income, reports, ai-suggestions, auth)
Budget-Management.Backend/    Express REST API
  ├─ config/      Sequelize + PostgreSQL connection
  ├─ models/      User, Category, Transaction, AISuggestion
  ├─ routes/      /api/auth, /api/users, /api/transactions, /api/categories, /api/suggestions
  ├─ services/    aiService (DeepSeek), transactionService
  └─ server.js    app entry point
```

## 🚀 Getting Started

**Backend**
```bash
cd Budget-Management.Backend
npm install
# create a .env file:
#   DB_CONNECTION_STRING=postgres://user:pass@host/dbname
#   DEEPSEEK_API_KEY=your_key
#   PORT=3000
node server.js          # API on http://localhost:3000
```

**Frontend**
```bash
cd Budget-Management.Frontend
npm install
npm start               # app on http://localhost:4200
```

## 📚 What I learned
Building a clean layered REST API with Sequelize, securing it with JWT + bcrypt, and integrating an LLM (DeepSeek) into a real product to turn raw transaction data into useful, human-readable advice.

---
Built by [Monther Ibrahem](https://montherib-swe.github.io/) · [LinkedIn](https://www.linkedin.com/in/mibrahem1) · [GitHub](https://github.com/MontherIB-SWE)
