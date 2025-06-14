# Multi-Agent App Builder Backend

This is the backend service for the AI-powered multi-agent website/app builder. It provides the API and WebSocket services needed to power the frontend application.

## Features

- RESTful API for project management, file operations, and version control
- WebSocket-based real-time collaboration
- Together AI integration for AI agents
- File-based storage system for projects and versions
- Cost-effective implementation using Together AI

## Prerequisites

- Node.js 16.x or later
- Together AI API key

## Installation

1. Clone the repository
2. Install dependencies:



3. Copy `.env.example` to `.env` and update with your Together AI API key:



4. Edit the `.env` file and set your Together AI API key.

## Running the Server

For development:



For production:



## API Routes

- `POST /api/start`: Start a new project
- `POST /api/:projectId/agent/:agentName`: Run a specific agent
- `GET /api/:projectId/files`: List all files in a project
- `GET /api/:projectId/file?path=...`: Get file content
- `POST /api/:projectId/file`: Save a file
- `GET /api/:projectId/versions`: List all versions
- `POST /api/:projectId/restore`: Restore to a specific version

## WebSocket Events

- `projectCreated`: Emitted when a new project is created
- `fileUpdated`: Emitted when a file is created or updated
- `agentChanged`: Emitted when the active agent changes
- `agentCompleted`: Emitted when an agent completes its task
- `versionRestored`: Emitted when a project is restored to a previous version

## Project Structure
