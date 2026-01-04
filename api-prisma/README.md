<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  <strong>A Garbage Collection Backend built with NestJS - an efficient and scalable Node.js framework.</strong>
</p>

---

## 📌 Table of Contents
- [Quick Start 🚀](#quick-start-🚀)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [Configure Environment](#configure-environment)
  - [Database Migration](#database-migration)
- [Running the App 🔥](#running-the-app-🔥)
- [Testing ⚡](#testing-⚡)
- [Stay in Touch 📬](#stay-in-touch-📬)
- [Important Note 📝](#important-note-📝)

---

## 🚀 Quick Start

### 📂 Clone the Repository

```bash
git clone https://github.com/jnoval/gcbackend.git
cd gcbackend
```

### 📦 Install Dependencies

```bash
npm install
```

### ⚙️ Configure Environment

Create a `.env` file in the root directory with the following content:

```env
# Database host (default: localhost)
DATABASE_HOST=localhost

# Database port (default: 3306 for MySQL/MariaDB)
DATABASE_PORT=3306

# Database username
DATABASE_USER=example_root

# Database password (leave blank if not set)
DATABASE_PASSWORD=

# Name of the database
DATABASE_NAME=example_gomicollection
```

> **Note:** Update the database credentials according to your MySQL/MariaDB setup.

### 📜 Database Migration

Before running the application, set up the database schema using migrations:

1. First, ensure your `package.json` includes these scripts:

```json
{
  "scripts": {
    "typeorm": "ts-node ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm migration:generate -- -d src/data-source.ts",
    "migration:run": "npm run typeorm migration:run -- -d src/data-source.ts",
    "migration:revert": "npm run typeorm migration:revert -- -d src/data-source.ts"
  }
}
```

2. Generate a new migration:

```bash
# Generate a migration for your entity changes
npm run migration:generate src/migrations/nameOfTheChanges
```

3. Run the migrations:

```bash
# Apply migrations to the database
npm run migration:run
```

4. If you need to revert a migration:

```bash
# Revert the last applied migration
npm run migration:revert
```

> **Note:** Ensure your database is running and accessible before executing migrations.

---

## 🔥 Running the App

Use the following commands to run the application:

```bash
# Run in development mode
npm run start  # Starts the server

# Run in watch mode
npm run start:dev  # Automatically reloads when files change

# Run in production mode
npm run start:prod  # Optimized for production
```

---

## ⚡ Testing

You can run tests to ensure the application works correctly:

```bash
# Run unit tests
npm run test

# Run end-to-end (e2e) tests
npm run test:e2e

# View test coverage report
npm run test:cov
```

---

## 📬 Stay in Touch

- **Framework**: [NestJS](https://nestjs.com)

---

## 📝 Important Note

### ⚠️ Correct Import Paths for Relationships
When importing related entities in TypeORM, **avoid using `src` in the import path**.
Instead, use relative paths (`..`).

❌ **Incorrect:**
```ts
import { Employee } from "src/employee/employee.entity";
```

✅ **Correct:**
```ts
import { Employee } from "../employee/employee.entity";
```

Using `src/` can cause issues when running TypeORM commands, as it references the TypeScript structure instead of the compiled JavaScript output.

---


