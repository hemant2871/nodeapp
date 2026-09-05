# Node-Mongo Form App with Docker

## Overview

This repository contains a simple **Node.js** web application that connects to a **MongoDB** database. The application demonstrates a basic form that lets users submit data, which is stored in MongoDB and displayed back on the page.

The project is fully containerised using **Docker**, allowing you to spin up the entire stack (Node app + MongoDB) with a single command. This README provides a comprehensive guide to:

- Understanding the Docker architecture of the project
- Building and running the containers locally
- Using Docker Compose for multi‑container orchestration
- Customising the setup for development and production

---

## Repository Structure

```
node-mongo-form-app/
├─ Dockerfile               # Builds the Node.js application image
├─ docker-compose.yml       # Orchestrates Node and Mongo containers
├─ src/                     # Source code of the Node.js app
│   ├─ index.js            # Main server entry point
│   └─ ...                 # Other source files (routes, models, etc.)
├─ package.json            # Node dependencies and scripts
├─ index.html              # Front‑end form UI
└─ README.md               # <--- You are here
```

---

## Docker Architecture

### 1. Node Application Container
- **Base Image**: `node:20-alpine`
- **Build Context**: The Dockerfile copies only the `package.json` and `package-lock.json` first, runs `npm ci` to install production dependencies, then copies the rest of the source code.
- **Runtime**: The container runs `npm start`, which starts the Express server listening on port `3000` (exposed to the host).

### 2. MongoDB Container
- **Image**: Official `mongo:7`
- **Data Persistence**: By default a Docker volume named `mongo-data` is used to persist the database across container restarts.
- **Port**: Exposes MongoDB's default `27017` port internally; external access is not required when using Docker Compose.

### 3. Docker Compose
- **Service `app`** – builds from the local `Dockerfile`, maps host port `3000` → container port `3000`, and depends on the `mongo` service.
- **Service `mongo`** – pulls the official image, sets a volume for data persistence, and provides an internal network alias `mongo` that the Node app uses to connect via the connection string `mongodb://mongo:27017/formdb`.
- **Network** – a single default bridge network is created, allowing the two services to communicate via their service names.

---

## Getting Started

### Prerequisites
- **Docker Desktop** (or Docker Engine) installed and running on your machine.
- **Git** (optional, for cloning the repository).

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/node-mongo-form-app.git
cd node-mongo-form-app
```

### 2. Build and Run with Docker Compose
```bash
# Build the images and start the containers in the background
docker compose up --build -d
```

The command performs the following steps:
1. **Builds** the `app` image using the `Dockerfile`.
2. **Pulls** the `mongo:7` image from Docker Hub.
3. **Creates** a network and a persistent volume (`mongo-data`).
4. **Starts** both containers.

### 3. Access the Application
Open your browser and navigate to **http://localhost:3000**. You should see the form UI. Submitting the form stores the data in MongoDB, which is then displayed on the page.

### 4. Stopping the Stack
```bash
docker compose down
```
This stops the containers and removes the network. The `mongo-data` volume remains, preserving any data you stored. To also delete the volume (i.e., reset the database), run:
```bash
docker compose down -v
```

---

## Development Workflow

If you want to edit the source code and see changes without rebuilding the image each time, you can use the **bind‑mount** approach:

```yaml
# docker-compose.yml (development override)
services:
  app:
    volumes:
      - ./src:/usr/src/app/src
    environment:
      - NODE_ENV=development
```

Then start the stack with:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
The Node container will watch for file changes (you may add `nodemon` to `package.json` scripts) and reload automatically.

---

## Production Considerations

1. **Multi‑Stage Build** – The provided `Dockerfile` already uses a multi‑stage build to keep the final image lightweight (only `node_modules` needed at runtime).
2. **Environment Variables** – Configure the following via a `.env` file (Docker Compose loads it automatically):
   ```
   # .env
   NODE_ENV=production
   PORT=3000
   MONGO_URI=mongodb://mongo:27017/formdb
   ```
3. **Healthchecks** – Add a simple healthcheck to the `app` service to ensure the container is ready before accepting traffic:
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
     interval: 30s
     timeout: 5s
     retries: 3
   ```
4. **Logging** – Docker forwards `stdout`/`stderr` to the host. Use `docker logs <container>` for troubleshooting.
5. **Scaling** – To run multiple instances behind a load balancer, you can scale the `app` service:
   ```bash
   docker compose up --scale app=3 -d
   ```
   (You would typically place a reverse proxy such as Nginx or Traefik in front of the replicas.)

---

## Common Commands Cheat‑Sheet
| Action | Command |
|--------|---------|
| Build images only | `docker compose build` |
| Start containers (foreground) | `docker compose up` |
| Start containers (background) | `docker compose up -d` |
| View running containers | `docker compose ps` |
| Stop and remove containers | `docker compose down` |
| Remove containers **and** volumes | `docker compose down -v` |
| View logs (app) | `docker logs <project>_app_1` |
| Access Mongo shell | `docker exec -it <project>_mongo_1 mongosh` |
| Rebuild after Dockerfile change | `docker compose up --build -d` |

---

## Troubleshooting

- **Container fails to start**: Check logs with `docker compose logs app` or `docker compose logs mongo`.
- **Cannot connect to MongoDB**: Ensure the connection string in `src/config.js` (or environment variable `MONGO_URI`) uses the service name `mongo` – not `localhost`.
- **Port conflict on host**: If another service uses port `3000`, change the host mapping in `docker-compose.yml` (e.g., `"8080:3000"`).

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Acknowledgements

- **Node.js** – JavaScript runtime.
- **Express** – Minimalist web framework.
- **MongoDB** – NoSQL database.
- **Docker** – Containerisation platform.
- **Docker Compose** – Multi‑container orchestration.

Feel free to fork, modify, and extend this example for your own learning or production needs! 🎉
