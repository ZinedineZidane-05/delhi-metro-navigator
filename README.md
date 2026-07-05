# 🚇 Delhi Metro Navigator

A full-stack web application for navigating the Delhi Metro network, built with **React** (frontend) and **Spring Boot** (backend).

## ✨ Features

### Core Features
- **Shortest Distance** — Find the minimum kilometer route between two stations (Dijkstra's algorithm)
- **Shortest Time** — Find the fastest travel route with station wait times
- **Route by Distance** — Full path with detailed station-by-station directions
- **Route by Time** — Fastest path with complete journey timeline
- **Interactive Metro Map** — SVG-based network visualization with all 20 stations and 19 connections
- **Station Directory** — Browse all stations with metro line information

### 🆕 New Features (v2)
1. **💰 Fare Calculation** — Automatic fare computation based on DMRC slab rates (₹10–₹60) with breakdown
2. **🚧 Blocked Stations & Alternate Routes** — Mark stations as blocked/closed and find alternate routes that avoid them
3. **▶️ Route Animation** — Animated visualization of your route on the metro map with glowing path and pulse effects

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.2, Vite 5, Axios |
| Backend | Spring Boot 3.2, Java 17 |
| Algorithm | Dijkstra's Shortest Path, DFS |
| Styling | Custom CSS (Dark Glassmorphism) |

## 🚀 Quick Start

### Prerequisites
- Java 17+, Maven 3.8+, Node.js 18+

### Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 📁 Project Structure
```
metro-app/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/metro/
│       ├── MetroApplication.java
│       ├── config/CorsConfig.java
│       ├── model/
│       │   ├── Vertex.java
│       │   ├── RouteRequest.java      ← NEW: blockedStations field
│       │   ├── StationInfo.java
│       │   ├── MapEdge.java
│       │   └── PathResponse.java      ← NEW: fare, fareBreakdown, alternateRoute
│       ├── service/
│       │   ├── Heap.java
│       │   └── MetroService.java      ← NEW: fare calc, blocked routes, alternate paths
│       └── controller/
│           └── MetroController.java   ← NEW: 2 alternate route endpoints
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/metro-icon.svg
    └── src/
        ├── main.jsx
        ├── api.js                     ← NEW: 2 alternate route API functions
        ├── App.jsx                    ← NEW: BlockedStationsSelector, fare display, animation
        └── index.css                  ← NEW: fare, blocked, animation styles
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stations` | List all stations |
| GET | `/api/map` | Get all edges |
| POST | `/api/shortest-distance` | Shortest distance + fare |
| POST | `/api/shortest-time` | Shortest time + fare |
| POST | `/api/shortest-path-distance` | Full path by distance + fare |
| POST | `/api/shortest-path-time` | Full path by time + fare |
| POST | `/api/alternate-path-distance` | **NEW** Alternate route avoiding blocked stations |
| POST | `/api/alternate-path-time` | **NEW** Alternate route (time) avoiding blocked stations |

## 💰 Fare Slabs (DMRC)

| Distance | Fare |
|----------|------|
| 0–2 KM | ₹10 |
| 2–5 KM | ₹20 |
| 5–12 KM | ₹30 |
| 12–21 KM | ₹40 |
| 21–32 KM | ₹50 |
| 32+ KM | ₹60 |

---
Built with ❤️ using React & Spring Boot
