# Personal Finance Management System — Frontend

A modern, responsive, and secure personal finance dashboard built with **React.js**, **Vite**, **React Router DOM**, **Axios**, and **Lucide React**, connecting to a Spring Boot REST API backend with JWT authentication.

---

## 🚀 Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with request & response interceptors
- **Icons**: Lucide React
- **Design System**: Responsive CSS with CSS Custom Properties (Variables), modern SaaS elevation, and Indian Rupee (`₹`) formatting.

---

## 📁 Architecture Overview

```text
frontend/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js     # Configured Axios instance with JWT interceptor & error normalization
│   │   ├── authApi.js           # Authentication API calls (login, register)
│   │   └── expenseApi.js        # Expense CRUD API calls (GET, POST, PUT, DELETE)
│   ├── components/
│   │   ├── ConfirmDialog.jsx    # Modal confirmation for deletion
│   │   ├── ExpenseFormModal.jsx # Add / Edit expense modal form with client validation
│   │   ├── ExpenseTable.jsx     # Responsive table with INR formatting & action buttons
│   │   ├── Layout.jsx           # Application shell with responsive sidebar & navbar
│   │   ├── LoadingSpinner.jsx   # Feedback spinner and loading states
│   │   ├── Navbar.jsx           # Top navigation bar with date, user greeting & mobile trigger
│   │   ├── ProtectedRoute.jsx   # Route guard enforcing authentication
│   │   ├── Sidebar.jsx          # Desktop & mobile navigation drawer
│   │   ├── SpendingChart.jsx    # Interactive SVG spending-over-time trend visualization
│   │   ├── SummaryCard.jsx      # Metrics card for totals, averages, counts
│   │   └── Toast.jsx            # Dynamic alert toasts for user feedback
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management with sessionStorage & JWT decoding
│   ├── pages/
│   │   ├── Dashboard.jsx        # Summary cards, spending trend chart, recent transactions
│   │   ├── Expenses.jsx         # Full expense management (search, filter, sort, pagination)
│   │   ├── Login.jsx            # User sign-in with password toggle & validation
│   │   ├── NotFound.jsx         # 404 page
│   │   └── Register.jsx         # New account registration
│   ├── styles/
│   │   └── global.css           # Design tokens, typography, surfaces, buttons, modals
│   ├── utils/
│   │   ├── currency.js          # Indian Rupee (INR) currency formatter (₹)
│   │   └── date.js              # Date formatting and chronological comparison helpers
│   ├── App.jsx                  # Route definitions
│   └── main.jsx                 # React root mount
├── .env.example                 # Environment configuration template
├── .env                         # Local environment configuration
├── index.html                   # HTML entry point with fonts
├── package.json                 # Dependencies and npm scripts
├── vite.config.js               # Vite config with dev API proxy
└── README.md                    # Project documentation
```

---

## ⚙️ Prerequisites & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24)
- **npm**: v9.0.0 or higher
- **Backend**: Spring Boot backend running on `http://localhost:8080` with MySQL

### 2. Environment Configuration
The frontend connects to the backend URL specified in `.env`:

```bash
# Copy template to .env if not already present
cp .env.example .env
```

Ensure `.env` contains:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Installation
Navigate into the `frontend` folder and install dependencies:

```bash
cd D:\personal-finance\frontend
npm install
```

### 4. Running the Development Server
Start Vite development server on port 5173:

```bash
npm run dev
```

The application will be accessible at:
👉 **`http://localhost:5173`**

### 5. Production Build
To create an optimized production build:

```bash
npm run build
```

---

## 🔒 Security & Authentication Architecture

1. **Token Storage**:
   - JWT tokens are stored in `sessionStorage` under `token`.
   - Never stored in `localStorage` or logged to the console to mitigate persistent XSS vulnerabilities.
   - User credentials (passwords) are never retained or logged.
2. **Axios Interceptor**:
   - Automatically attaches `Authorization: Bearer <JWT_TOKEN>` on every protected request.
   - Automatically detects `401 Unauthorized` responses and logs the user out, clearing `sessionStorage`.
3. **CORS Support**:
   - The Spring Boot backend (`SecurityConfig.java`) has been configured to allow requests from `http://localhost:5173` and `http://127.0.0.1:5173` with credentials and headers.
   - In addition, Vite's dev server (`vite.config.js`) proxies `/api` calls directly to `http://localhost:8080`.

---

## 🧪 Testing the Application

1. **Start the Backend**:
   - Ensure MySQL is running.
   - In `D:\personal-finance\personal-finance`, run:
     ```bash
     ./mvnw spring-boot:run
     ```
2. **Start the Frontend**:
   - In `D:\personal-finance\frontend`, run:
     ```bash
     npm run dev
     ```
3. **Register an Account**:
   - Visit `http://localhost:5173/register`
   - Fill in username and password, submit to create your account.
4. **Log In**:
   - Visit `http://localhost:5173/login`
   - Log in with your new username and password.
5. **Dashboard & Expense CRUD**:
   - Verify summary cards show ₹0.00 and 0 transactions initially.
   - Click **Add Expense** and create expenses with amounts, dates, and descriptions.
   - Verify summary cards update with real calculations (Total, Count, Average, Most Recent).
   - Verify spending chart displays points and curves for recorded dates.
   - Edit and delete expenses, verifying real-time synchronization.
