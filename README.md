# Event Management Application

This project is a university coursework application, designed as a full-stack event platform where users can create events, join them, manage their participation, and engage in event discussions.

The application demonstrates practical experience with full-stack development, REST APIs, authentication, database integration, and Docker-based local development.

## Overview

The app allows users to:

- sign up and log in securely
- create and edit their own events
- browse available events
- join or leave events
- view events they created or subscribed to
- discuss events in a simple comment-based discussion system

## Tech Stack

- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB
- Authentication: JWT
- Containerization: Docker + Docker Compose

## Main Features

- User authentication and authorization
- Event creation and management
- Event filtering and browsing
- Participant signup and leave flow
- Personalized event lists for created and joined events
- Event discussion with posts and comments

## Prerequisites

Before running the project, install:

- Docker Desktop
- Docker Compose

## Running the Project

Create a root `.env` file with the following values:

```env
PORT=8081
DB=mongodb://mongo:27017/event_app
JWTPRIVATEKEY=your_secure_secret
SALT=10
REACT_APP_API_URL=http://localhost:8081
MONGO_INITDB_DATABASE=event_app
```

Then start the project with:

```bash
docker compose up --build
```

The application will be available at:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8081
- MongoDB: localhost:27018
