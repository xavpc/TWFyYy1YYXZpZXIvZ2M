<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  <strong>A Garbage Collection Backend built with NestJS and Prisma ORM.</strong>
</p>

---

## Table of Contents
- [Quick Start](#quick-start)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [Configure Environment](#configure-environment)
  - [Database Setup with Prisma](#database-setup-with-prisma)
- [Running the App](#running-the-app)
- [Prisma Commands](#prisma-commands)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Stay in Touch](#stay-in-touch)

---

## Quick Start

### Clone the Repository

```bash
git clone https://github.com/jnoval/gcbackend.git
cd gcbackend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env` file in the root directory with the following content:

```env
# Database connection URL for Prisma
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:password@localhost:3306/gomicollection"

# Backend port
BACKEND_PORT=3001

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Maps API Key (for routing)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

For production, create a `.env.online` file with production values.

> **Note:** Update the `DATABASE_URL` according to your MySQL setup.

### Database Setup with Prisma

1. **Generate Prisma Client:**

```bash
npm run prisma:generate
```

2. **Run Database Migrations:**

```bash
# Development - creates migration and applies it
npm run prisma:migrate

# Production - applies pending migrations
npm run prisma:migrate:prod
```

3. **View Database with Prisma Studio (optional):**

```bash
npm run prisma:studio
```

4. **Seed the Database (optional):**

```bash
npm run prisma:seed
```

---

## Running the App

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Standard mode
npm run start
```

The API will be available at `http://localhost:3001` (or your configured port).

API documentation is available at `http://localhost:3001/guide`.

---

## Prisma Commands

| Command | Description |
|---------|-------------|
| `npm run prisma:generate` | Generate Prisma Client from schema |
| `npm run prisma:migrate` | Create and apply migrations (dev) |
| `npm run prisma:migrate:prod` | Apply pending migrations (prod) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:seed` | Run database seeding |

### Manual Prisma Commands

```bash
# Pull database schema into Prisma
npx prisma db pull

# Push schema changes without migration
npx prisma db push

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

---

## Testing

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# View test coverage
npm run test:cov
```

---

## Project Structure

```
api-prisma/
├── prisma/
│   └── schema.prisma      # Database schema definition
├── src/
│   ├── common/
│   │   └── filters/       # Exception filters (Prisma errors)
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── [feature-modules]/
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── *.controller.ts
│   │   ├── *.service.ts
│   │   └── *.module.ts
│   ├── app.module.ts
│   └── main.ts
├── .env                   # Environment variables (dev)
├── .env.online            # Environment variables (prod)
└── package.json
```

---

## Stay in Touch

- **Framework**: [NestJS](https://nestjs.com)
- **ORM**: [Prisma](https://prisma.io)
- **Database**: MySQL

---
