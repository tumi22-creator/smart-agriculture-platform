# AgriMonitor — Smart Agriculture Monitoring Platform

A full-stack agriculture monitoring application for managing farms, tracking crops, recording environmental sensor readings, and monitoring farm alerts through a web dashboard.

**Live Demo:** https://smart-agriculture-platform-phi.vercel.app  
**Backend API:** https://smart-agriculture-platform-a2xz.onrender.com  
**Repository:** https://github.com/tumi22-creator/smart-agriculture-platform

## Features

### Farm Management
- Register farms with their location, land size, and soil type.
- View registered farms and select a farm to monitor.
- Track total registered farms and land area.

### Crop Management
- Create and manage crop records.
- Record crop varieties, planting dates, expected harvest dates, and growth statuses.
- Associate crops with farms.

### Sensor Monitoring
- Record soil moisture, temperature, and humidity readings.
- View sensor reading history and trends.
- Review average sensor measurements and the latest recorded conditions.

### Farm Alerts
- View active farm alerts.
- Identify alerts by severity.
- Resolve alerts when they have been addressed.

### Dashboard Analytics
- View farm statistics, crop counts, sensor conditions, and active alerts.
- Switch between farms to view their associated information.
- Visualize recorded sensor trends.

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Gradle

**Database**
- PostgreSQL
- Neon

**Deployment**
- Vercel — frontend hosting
- Render — backend hosting
- GitHub — source control

## Architecture

The frontend communicates with a Spring Boot REST API. The backend uses Spring Data JPA to persist farm, crop, sensor-reading, and alert records in PostgreSQL.

```text
User
 |
 v
React + Vite Dashboard
(Vercel)
 |
 | HTTP requests / REST API
 v
Spring Boot API
(Render)
 |
 | Spring Data JPA
 v
PostgreSQL Database
(Neon)
```

## API Endpoints

The following endpoints are implemented in the backend. API routes under `/api/**` require administrator authentication.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/farms` | Retrieve farms |
| GET | `/api/farms/{id}` | Retrieve a farm |
| POST | `/api/farms` | Register a farm |
| GET | `/api/crops` | Retrieve crops |
| GET | `/api/crops/{id}` | Retrieve a crop |
| POST | `/api/crops` | Create a crop |
| GET | `/api/crops/farm/{farmId}` | Retrieve crops for a farm |
| PUT | `/api/crops/{cropId}/farm/{farmId}` | Associate a crop with a farm |
| GET | `/api/farms/{farmId}/sensor-readings` | Retrieve sensor history |
| POST | `/api/farms/{farmId}/sensor-readings` | Record a sensor reading |
| GET | `/api/farms/{farmId}/alerts` | Retrieve farm alerts |
| GET | `/api/farms/{farmId}/alerts/active` | Retrieve active alerts |
| PUT | `/api/farms/{farmId}/alerts/{alertId}/resolve` | Resolve an alert |

## Run Locally

### Prerequisites

- Java 21
- Node.js and npm
- PostgreSQL database, such as a Neon development database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/tumi22-creator/smart-agriculture-platform.git
cd smart-agriculture-platform
```

### 2. Configure the backend

Configure the required environment variables in your local environment or IntelliJ run configuration:

- `DATABASE_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Use your own development database and credentials. Do not commit passwords, database credentials, or production secrets.

### 3. Start the backend

On Windows:

```cmd
gradlew.bat bootRun
```

The default Spring Boot port is typically `8080`, unless changed by your application configuration.

### 4. Configure and start the frontend

Open a second terminal:

```cmd
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/` containing the backend API URL:

```env
VITE_API_URL=http://localhost:8080
```

Use the actual local backend port if your configuration differs.

Start the frontend:

```cmd
npm run dev
```

Open the local Vite URL printed in the terminal, usually `http://localhost:5173`.

## Deployment

- The frontend is deployed on Vercel.
- The backend is deployed on Render using Docker.
- PostgreSQL is hosted on Neon.
- The frontend uses `VITE_API_URL` to locate the backend API.
- The backend CORS configuration allows the deployed frontend origin.

Free hosting services may take time to respond after periods of inactivity.

## Security Notes

This project includes administrator authentication using Spring Security HTTP Basic authentication, role-based route protection, password hashing with BCrypt, and CORS configuration.

The current authentication implementation uses an in-memory administrator account configured through environment variables. This is a portfolio demonstration and is not a complete production authentication system.

Before production use, implement and test a stronger authentication and authorization design, HTTPS-only credential handling, account lifecycle management, appropriate rate limiting, and additional security controls.

## Current