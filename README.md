# Personal Finance Management System

A full-stack, enterprise-grade personal finance application designed for tracking personal expenses, visualizing spending patterns, and managing finances with user isolation and secure authentication.

---

## 🏗️ Architecture Overview

The system is organized into a decoupled frontend and backend:

- **Backend (`/personal-finance`)**: Java 17, Spring Boot, Spring Security, Spring Data JPA, Hibernate, JWT (JSON Web Tokens), MySQL.
- **Frontend (`/frontend`)**: React 18, Vite, React Router DOM v6, Axios, Lucide React, responsive CSS design system.
- **Database**: MySQL relational database (`personal_finance`).

```text
personal-finance/
├── .github/                   # CI/CD workflows (if configured)
├── frontend/                  # React.js + Vite client application (Port 5173)
│   ├── src/
│   │   ├── api/               # Axios REST API services & JWT interceptors
│   │   ├── components/        # Layout, Sidebar, Navbar, Modals, Tables, Chart
│   │   ├── context/           # AuthContext managing session & JWT state
│   │   ├── pages/             # Login, Register, Dashboard, Expenses, NotFound
│   │   ├── styles/            # Global design tokens (Emerald & Navy theme)
│   │   └── utils/             # INR currency and date formatting utilities
│   ├── .env.example           # Frontend environment template
│   └── package.json
├── personal-finance/          # Spring Boot REST API service (Port 8080)
│   ├── src/main/java/com/vichu/personal_finance/
│   │   ├── config/            # Spring Security & JWT Filter & CORS configuration
│   │   ├── controller/        # Auth, Expense, and Admin REST controllers
│   │   ├── dto/               # Request & Response DTO contracts
│   │   ├── entity/            # User and Expense JPA entities
│   │   ├── exception/         # Global exception handler & custom exceptions
│   │   ├── repository/        # Spring Data JPA repositories
│   │   └── service/           # User, Expense, and JWT service implementations
│   ├── src/main/resources/    # application.properties
│   ├── .env.example           # Backend environment template
│   └── pom.xml
└── README.md                  # Project documentation
```

---

## 📋 Prerequisites

Ensure the following tools are installed on your machine:

- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **MySQL Server**: Version 8.0 or higher

---

## 🗄️ MySQL Database Setup

1. Start your local MySQL service.
2. Log in to MySQL using your client (e.g., MySQL Workbench or MySQL CLI):
   ```bash
   mysql -u root -p
   ```
3. Create the database for the application:
   ```sql
   CREATE DATABASE IF NOT EXISTS personal_finance;
   ```
4. Verify that your MySQL user has privileges to read and write to `personal_finance`:
   ```sql
   GRANT ALL PRIVILEGES ON personal_finance.* TO 'your_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

*Note: Hibernate is configured with `spring.jpa.hibernate.ddl-auto=update`, which will automatically generate and update table schemas (`users`, `expense`) upon backend startup.*

---

## ⚙️ Environment Configuration

### 1. Backend Environment (`/personal-finance`)
The Spring Boot backend reads credentials from environment variables defined in [`application.properties`](file:///d:/personal-finance/personal-finance/src/main/resources/application.properties):

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DB_USERNAME` | MySQL user account | `root` or `finance_user` |
| `DB_PASSWORD` | MySQL password | `your_mysql_password` |
| `JWT_SECRET` | HMAC-SHA256 signing secret (min 256 bits / 32 characters) | *A 32+ character secure random string* |

A template is provided in `personal-finance/.env.example`:
```env
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_256_bit_jwt_secret_key_change_this_value_in_production
```

**Setting Environment Variables:**
- **Windows (PowerShell)**:
  ```powershell
  $env:DB_USERNAME="your_mysql_username"
  $env:DB_PASSWORD="your_mysql_password"
  $env:JWT_SECRET="your_secure_256_bit_jwt_secret_key_change_this_value_in_production"
  ```
- **Linux / macOS (Bash)**:
  ```bash
  export DB_USERNAME="your_mysql_username"
  export DB_PASSWORD="your_mysql_password"
  export JWT_SECRET="your_secure_256_bit_jwt_secret_key_change_this_value_in_production"
  ```

---

### 2. Frontend Environment (`/frontend`)
The frontend connects to the backend REST API via the base URL defined in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```
*(Copy from `frontend/.env.example` if initializing on a new machine).*

---

## 🚀 Running the Application

### Step 1: Start the Spring Boot Backend
From the root workspace directory, navigate to `personal-finance`:

```powershell
cd D:\personal-finance\personal-finance

# Ensure environment variables are set in your shell
$env:DB_USERNAME="your_mysql_username"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="your_secure_256_bit_jwt_secret_key_change_this_value_in_production"

# Start the Spring Boot application
.\mvnw.cmd spring-boot:run
```
*(On Linux/macOS, use `./mvnw spring-boot:run`)*.

The backend REST API will start and listen on:
👉 **`http://localhost:8080`**

---

### Step 2: Start the React Frontend
In a separate terminal window, navigate to `frontend`:

```powershell
cd D:\personal-finance\frontend

# Install dependencies (first time only)
npm install

# Start Vite development server
npm run dev
```

The frontend application will start and listen on:
👉 **`http://localhost:5173`**

---

## 📡 REST API Reference

All requests to `/api/expenses/**` require the header:
`Authorization: Bearer <JWT_TOKEN>`

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | `{ "username": "vichu", "password": "password123" }` | `{ "id": 1, "username": "vichu", "role": "USER" }` |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | `{ "username": "vichu", "password": "password123" }` | `{ "token": "<JWT_STRING>" }` |

### Expense Management Endpoints (Authenticated)

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/expenses` | List all expenses for current user | *None* | `[ { "id": 1, "amount": 250.00, "date": "2026-10-17", "description": "Groceries" } ]` |
| `GET` | `/api/expenses/{id}` | Get individual expense | *None* | `{ "id": 1, "amount": 250.00, "date": "2026-10-17", "description": "Groceries" }` |
| `POST` | `/api/expenses` | Create a new expense | `{ "amount": 250.00, "date": "2026-10-17", "description": "Groceries" }` | `{ "id": 1, "amount": 250.00, "date": "2026-10-17", "description": "Groceries" }` |
| `PUT` | `/api/expenses/{id}` | Update existing expense | `{ "amount": 300.00, "date": "2026-10-17", "description": "Updated" }` | `{ "id": 1, "amount": 300.00, "date": "2026-10-17", "description": "Updated" }` |
| `DELETE`| `/api/expenses/{id}` | Delete an expense | *None* | `204 No Content` |

### Administration Endpoints (Role: ADMIN)

| Method | Endpoint | Description | Header Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/test` | Admin access verification | `Authorization: Bearer <ADMIN_JWT>` |

---

## 🔒 Security & Data Isolation Best Practices

1. **Password Hashing**: Passwords are never stored in plaintext or returned in API responses; they are securely hashed using BCrypt.
2. **User Data Isolation**: Expenses are associated with the authenticated user via their JWT subject (`username`). All queries (`findByUser_Username`, `findByIdAndUser_Username`) enforce that users can only view, modify, or delete their own records.
3. **Token Management**: The frontend stores JWT tokens in `sessionStorage` rather than `localStorage` to reduce the risk of cross-tab persistent attacks.
4. **CORS Defense**: The backend explicitly configures allowed origins (`http://localhost:5173`, `http://127.0.0.1:5173`), allowed HTTP methods, and exposed headers in `SecurityConfig.java`.
5. **No Secret Leakage**: All `.gitignore` files are configured to exclude `.env`, log files, build artifacts (`/target`, `/dist`, `/node_modules`), and OS cache files.
