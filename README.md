# RoadEye

**RoadEye** — Hackathon project

A lightweight platform that uses computer vision and sensor data to detect road hazards, monitor traffic, and help municipalities and commuters respond faster. Built as a hackathon MVP to demonstrate real-time detection, alerts, and a simple dashboard.

---

## Table of Contents

* [Demo](#demo)
* [Features](#features)
* [Architecture & Tech Stack](#architecture--tech-stack)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Local Setup](#local-setup)
* [Usage](#usage)
* [API Endpoints](#api-endpoints)
* [Development](#development)
* [Contributing](#contributing)
* [Testing](#testing)
* [Roadmap](#roadmap)
* [License](#license)
* [Contact](#contact)

---

## Demo

> Add a short link or GIF here showing the running app or dashboard.

---

## Features

* Real-time hazard detection (potholes, debris, accidents) via camera feed.
* Aggregation of sensor data (optional GPS / accelerometer) from edge devices or mobile clients.
* Web dashboard for viewing live alerts and recent incidents.
* Historical incident feed with basic filtering (time, location, severity).
* Export incidents as CSV / simple report generation.
* Simple authentication for operators.

---

## Architecture & Tech Stack

**Frontend**

* React + Tailwind CSS (single-page dashboard)

**Backend**

* Golang microservice(s)
* PostgreSQL for persistence
* GraphQL API layer (Apollo/GraphQL server wrapper)

**ML / CV**

* Lightweight object detection (e.g. MobileNet/YOLO-tiny) running on edge or server
* Python model prototype (optional) — can call REST endpoint or publish events

**Deployment**

* Docker + Docker Compose for local/dev
* (Optional) Kubernetes / Cloud run for production

---

## Getting Started

### Prerequisites

* Git
* Docker & Docker Compose
* Go (1.20+ recommended) for local build
* Node.js & npm/yarn for frontend
* PostgreSQL (or run as a container)

### Local Setup (Quickstart)

1. Clone the repo:

```bash
git clone https://github.com/<your-username>/roadeye.git
cd roadeye
```

2. Copy environment example and edit:

```bash
cp .env.example .env
# edit .env to set DB credentials, secrets, etc.
```

3. Start services with Docker Compose:

```bash
docker compose up --build
```

4. Backend:

```bash
# from the backend folder
make migrate    # if you use makefile for DB migrations
go run ./cmd/server
```

5. Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` (or the port shown in the terminal).

---

## Usage

* Use the dashboard to view real-time camera feeds and detected incidents.
* Click an incident to view details (location, timestamp, confidence, sensor snapshot).
* Operators can acknowledge incidents and mark their status (open, in-progress, resolved).

---

## API Endpoints

> The project exposes a GraphQL API. Add example queries/mutations relevant to your schema below.

**Example GraphQL query**

```graphql
query Incidents($limit: Int) {
  incidents(limit: $limit) {
    id
    type
    confidence
    location {
      lat
      lng
    }
    createdAt
    status
  }
}
```

---

## Development

* Use feature branches: `git checkout -b feat/<short-description>`
* Run linter and tests before pushing.

### Useful commands

```bash
# Backend
go test ./...
go vet ./...

# Frontend
npm run lint
npm run test
```

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Open a pull request describing your changes

Please follow the code style and include tests for new functionality.

---

## Testing

* Unit tests for backend services
* End-to-end tests for critical flows (ingest -> detection -> dashboard)
* CI pipeline (GitHub Actions) to run build, test, and linting on PRs

---

## Roadmap

* [ ] Improve model accuracy and add more hazard classes
* [ ] Add user roles and permissions
* [ ] Mobile client for direct reporting
* [ ] Offline data buffering for intermittent connectivity
* [ ] Multi-region deployment and clustering

---

## License

This project is released under the MIT License. See `LICENSE` for details.

---

## Contact

Maintainer — `<your-name> (<your-email>)`

If you want, tell me what to fill in for placeholders (demo link, GraphQL schema, commands), and I will update the README.
