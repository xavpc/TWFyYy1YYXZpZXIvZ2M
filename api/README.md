<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  <strong>A Garbage Collection Backend built with NestJS - an efficient and scalable Node.js framework.</strong>
</p>

---

## Table of Contents
- [Quick Start 🚀](#quick-start-🚀)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [Configure Environment](#configure-environment)
- [Running the App 🔥](#running-the-app-🔥)
- [Test ⚡](#test-⚡)
- [Support](#support)
- [Stay in Touch](#stay-in-touch)
- [License](#license)

---

## Quick Start 🚀

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

---

## Running the App 🔥

To run the application, use the following commands:

```bash
# Run in development mode
npm run start  # Starts the server

# Run in watch mode
npm run start:dev  # Automatically reloads when files change

# Run in production mode
npm run start:prod  # Optimized for production
```

---

## Test ⚡

You can run various tests to ensure the application is working correctly:

```bash
# Run unit tests (tests isolated components of the application)
npm run test

# Run end-to-end (e2e) tests (tests the entire application flow)
npm run test:e2e

# View test coverage report
npm run test:cov
```

---

## Stay in Touch

- **Framework**: [NestJS](https://nestjs.com)
