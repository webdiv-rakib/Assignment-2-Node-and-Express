# DevPulse Issue Tracker API

**Live API URL:** [https://devpulse-five-zeta.vercel.app/]

A robust RESTful backend service built for managing technical issues and feature requests. This API features secure authentication and strict Role-Based Access Control (RBAC), engineered entirely with raw SQL queries without the use of an ORM or SQL `JOIN` operations.

## Features

* **Secure Authentication:** User registration and login utilizing `bcryptjs` for password hashing and JSON Web Tokens (JWT) for stateless authentication.
* **Role-Based Access Control (RBAC):** Strict permission handling for `contributor` and `maintainer` roles.
* **Resource-Level Security:** Contributors can only update their own issues, and only if the issue status is currently 'open'. Maintainers have global access.
* **Dynamic SQL Engine:** Advanced querying, sorting, and filtering built dynamically via query parameters.
* **Raw PostgreSQL Execution:** Complex data mapping and batch fetching executed strictly via raw SQL without `JOIN` clauses.
* **Uniform Error Handling:** Standardized API response wrappers for consistent success and error payloads.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL (via `pg` driver)
* **Security:** JWT (jsonwebtoken), bcryptjs

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd <your-repo-folder>

   Install dependencies: `npm install`

   Environment Variables:create `.env`
   PORT=5000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=1d

   Initialize the Database:
   Start the development server: `npm run dev`

## 📡 API Endpoints
Authentication:
Method:POST     Endpoint: /api/auth/signup
Method:POST     Endpoint: /api/auth/login

Issues:
Method:POST     Endpoint: /api/issues
Method:GET      Endpoint: /api/issues
Method:GET      Endpoint: /api/issues/:id
Method:PATCH    Endpoint: /api/issues/:id
Method:DELETE   Endpoint: /api/issues/:id

## 🗄️ Database Schema Summary
users Table
id (SERIAL, Primary Key)
name (VARCHAR)
email (VARCHAR, Unique)
password (VARCHAR, Hashed)
role (VARCHAR: 'contributor' | 'maintainer')
created_at (TIMESTAMP)

issues Table
id (SERIAL, Primary Key)
title (VARCHAR)
description (TEXT)
type (VARCHAR: 'bug' | 'feature_request')
status (VARCHAR: 'open' | 'in_progress' | 'resolved')
reporter_id (INTEGER, Foreign Key referencing users.id)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

