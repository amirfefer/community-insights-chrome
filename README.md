# Open Services Platform

**Status:** In Progress

This repository contains a **forked** version of the Red Hat Hybrid Console Chroming app, adapted for use in a community Open Services Platform. The primary goal of this fork is to maintain compatibility with the Chrome API while enabling additional integrations, such as Single Sign-On (SSO) and feature flags.


---

## Table of Contents

1. [Overview](#overview)  
2. [Directory Structure](#directory-structure)  
3. [Prerequisites](#prerequisites)  
4. [Setup Guide](#setup-guide)  
   - [Step 1: Clone Repositories](#step-1-clone-repositories)  
   - [Step 2: Start Supporting Services](#step-2-start-supporting-services)  
   - [Step 3: Start Chrome Service Backend](#step-3-start-chrome-service-backend)  
   - [Step 4: Start Image Builder Frontend](#step-4-start-image-builder-frontend)  
   - [Step 5: Start Image Builder Backend](#step-5-start-image-builder-backend)  
   - [Step 6: Start the Combined Development Environment](#step-6-start-the-combined-development-environment)  
5. [Accessing the Application](#accessing-the-application)  
6. [Credentials](#credentials)  
7. [Notes](#notes)

---

## Overview

The `insights-chrome` repository (this repository) is part of a development setup that includes several other repositories. It handles the application layout, navigation, SSO integration, and feature flag management. Together, these repositories enable a fully functional Open Services Platform.

---

## Directory Structure

Below is the expected directory structure for local development under a folder named `open-services`:

    open-services/
    ├── insights-chrome           # This repository (forked version)
    ├── chrome-service-backend    # Backend service for Chrome
    ├── image-builder             # Backend service for Image Builder
    └── image-builder-frontend    # Frontend service for Image Builder

---

## Prerequisites

Ensure you have the following installed:

- **Git**  
- **Docker** or **Podman**  
- **Node.js** (and **npm**)
- **Go**
- **Make**  

---

## Setup Guide

### Step 1: Clone Repositories

Clone the required repositories into a directory called `open-services` (the exact folder name is up to you, but the structure above is recommended):

    git clone git@github.com:amirfefer/insights-chrome.git
    git clone git@github.com:amirfefer/chrome-service-backend.git
    git clone image-builder
    git clone image-builder-frontend

---

### Step 2: Start Supporting Services

1. Navigate to the `standalone` folder inside `insights-chrome`:
   
       cd insights-chrome/standalone

2. Use Docker Compose (or Podman Compose) to start the required supporting services:

       docker-compose up
       # OR if using Podman:
       podman-compose up

This will launch:
- A **Keycloak** container for local SSO.
- An **Unleash** proxy for feature flag management.
- Containers for **PostgreSQL** and **Kafka**.

---

### Step 3: Start Chrome Service Backend

1. Navigate to the `chrome-service-backend` folder:

       cd ../chrome-service-backend

2. Create a basic environment file:

       make env

3. Wait until the containers started in Step 2 are healthy, then start the backend service:

       make dev

The backend service should now be running on **port 8000**.

---

### Step 4: Start Image Builder Frontend

1. Navigate to the `image-builder-frontend` folder:

       cd ../image-builder-frontend

2. Start the frontend as a static federated module:

       npm run start:federated

The frontend service should now be running on **port 8003**.

---

### Step 5: Start Image Builder Backend

1. In the `image-builder` folder, create a file named `docker-compose.image-builder.yml` (for example) containing the following:

       version: '3.7'
       volumes:
         pg-db:
       services:
         db:
           image: arm64v8/postgres:15.1
           environment:
             POSTGRES_USER: postgres
             POSTGRES_PASSWORD: postgres
             POSTGRES_DB: image-builder
           volumes:
             - pg-db:/var/lib/postgresql/data
           ports:
             - 8001:5432
           healthcheck:
             test: ["CMD-SHELL", "pg_isready -U postgres -d image-builder"]
             interval: 2s
             retries: 10

         backend:
           build:
             context: .
             dockerfile: distribution/Dockerfile-ubi
           environment:
             PGHOST: db
             PGPORT: 5432
             PGDATABASE: image-builder
             PGUSER: postgres
             PGPASSWORD: postgres
             LISTEN_ADDRESS: backend:8086
             LOG_LEVEL: DEBUG
           depends_on:
             db:
               condition: service_healthy
           ports:
             - 8086:8086

2. Launch the Image Builder backend containers:

       cd ../image-builder
       docker-compose -f docker-compose.image-builder.yml up

This spins up a local PostgreSQL and the Image Builder backend on **port 8086**.

---

### Step 6: Start the Combined Development Environment

1. Navigate back to the `insights-chrome` directory:

       cd ../insights-chrome

2. Run the development command with environment variables pointing to the ports of the backend services:

       CHROME_SERVICE=8000 IB_SERVICE=8086 IB_FRONTEND=8003 npm run dev

This command:
- Sets the **Chrome** backend to port 8000 (`CHROME_SERVICE=8000`)
- Sets the **Image Builder** backend to port 8086 (`IB_SERVICE=8086`)
- Sets the **Image Builder** frontend to port 8003 (`IB_FRONTEND=8003`)

The development environment should now be active.

---

## Accessing the Application

After all services are running, open your browser and navigate to:

    https://localhost:1337

---

## Credentials

Use the following credentials to log in:

- **Username:** admin  
- **Password:** admin  

---

## Notes

1. **Timing:** Ensure that all containers (Keycloak, Unleash, DB, Kafka, etc.) have fully started before starting dependent services.  
2. **Port Conflicts:** If any default ports conflict with other local services, adjust them accordingly.  
3. **Production Considerations:** This setup is meant for local development only. Additional security, scaling, and configuration steps are required for any production environment.

---
