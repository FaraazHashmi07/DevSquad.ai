# DevSquad.ai - Multi-Agent App Builder

This project implements a zero-cost, AI-powered multi-agent website/app builder that collaboratively translates user requirements into fully functional web applications through the coordination of specialized AI agents.

## 🚀 Quick Start

1. **Clone the repository**
2. **Set up API keys** (see [API Configuration](#api-configuration) below)
3. **Install dependencies and run** (see [Installation](#installation) below)
4. **Start building** - Enter your project idea and watch the AI agents work!

## Overview

The Multi-Agent App Builder leverages a team of specialized AI agents that collaborate to build complete, deployable websites:

- **Emma (Product Manager)**: Creates comprehensive PRDs with feature specifications and user stories for any website type
- **Bob (Software Architect)**: Designs system architecture and modern technology stack for web applications
- **Alex (Software Engineer)**: Implements production-ready frontend and backend code with best practices
- **David (Data Analyst)**: Designs data models, APIs, and database schemas for data-driven applications
- **DevOps Engineer**: Handles build configuration, CI/CD pipelines, deployment setup, and environment management

## Supported Website Types

The system can generate complete, deployable websites including:
- Personal Portfolios, Weather Apps, To-Do Lists, Landing Pages
- E-Commerce Catalogs, Blog Websites, Calculator Apps, Quiz Applications
- Music Players, Image Galleries, Clock/Timer Apps, Recipe Applications
- Color Picker Tools, Typing Speed Tests, Login/Register Interfaces
- And any other type of web application you can describe

The system supports real-time collaboration through WebSockets and provides file editing, version control, and project management features.

## Project Structure

```
├── backend/                # Backend Node.js server
│   ├── controllers/       # API route handlers
│   ├── services/          # Business logic
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
│
├── src/                   # Frontend React application
│   ├── components/        # React components
│   │   ├── Console/       # Console log components
│   │   ├── Editor/        # Code editor components
│   │   ├── FileExplorer/  # File explorer components
│   │   ├── TeamBar/       # Team display components
│   │   ├── Versioning/    # Version control components
│   │   └── common/        # Reusable UI components
│   ├── context/           # React context providers
│   ├── services/          # API and socket services
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Entry point
│
└── docs/                  # Documentation
    ├── PRD.md             # Product Requirements Document
    └── Architecture.md    # Architecture Document
```

## Installation

### Prerequisites

- Node.js 16.x or later
- npm or pnpm
- Together AI API keys (see [API Configuration](#api-configuration) below)

## API Configuration

DevSquad.ai uses a **dual API setup** with Together AI for optimal performance:

- **Emma (Business Analyst)** uses **Gemma models** for creating comprehensive business documents and presentations
- **Other agents** (Bob, David, Alex, DevOps) use **Mistral models** for technical implementation

### Step 1: Get Your API Keys

1. Visit [Together AI](https://api.together.xyz/)
2. Sign up for an account (free tier available)
3. Navigate to your API dashboard
4. Generate **two API keys**:
   - One for Gemma models (Emma)
   - One for Mistral models (other agents)

### Step 2: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit the `.env` file** and replace the placeholder values:
   ```bash
   # DevSquad.ai API Configuration
   GEMMA_API_KEY=your_actual_gemma_api_key_here
   TOGETHER_API_KEY=your_actual_together_ai_api_key_here
   ```

3. **Save the file** and restart the backend server

### Step 3: Verify Configuration

The backend will automatically validate your API keys on startup:

- ✅ **Success**: "All API clients initialized successfully"
- ❌ **Error**: Clear instructions will be provided to fix configuration issues

### API Key Security

- ⚠️ **Never commit your actual API keys to version control**
- 🔒 **Keep your `.env` file secure and private**
- 🔄 **Rotate your API keys regularly for security**
- 📝 **The `.env` file is already in `.gitignore`**

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/FaraazHashmi07/DevSquad.ai.git
cd DevSquad.ai

# Install frontend dependencies
npm install
# or
pnpm install

# Start the development server
npm run dev
# or
pnpm run dev
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install backend dependencies
npm install
# or
pnpm install

# Configure API keys (see API Configuration section above)
cp .env.example .env
# Edit .env file with your actual API keys

# Start the backend server
npm run dev
# or
pnpm run dev
```

### Troubleshooting

**Common Issues:**

1. **"API client not initialized" errors**
   - Check that your API keys are correctly set in `backend/.env`
   - Ensure you're using actual API keys, not placeholder values
   - Restart the backend server after changing `.env`

2. **"Failed to fetch workflow status" errors**
   - Ensure the backend server is running on port 3000
   - Check that both frontend (5173) and backend (3000) are running

3. **Agents not generating content**
   - Verify your Together AI API keys have sufficient credits
   - Check the backend console for specific error messages
   - Ensure you have access to both Gemma and Mistral models

## Usage

1. Open the application in your browser at http://localhost:5173
2. Enter your project description in the input field (e.g., "Create a React + Firebase chat app with login and admin dashboard")
3. Click "Start" to initialize the project
4. Emma (PM) will begin by creating a PRD, followed by other agents working in sequence
5. Monitor progress in the Console and explore files in the File Explorer
6. Edit files directly in the Code Editor
7. Use the Versions feature to create and restore project snapshots

## Features

- **Multi-Agent Collaboration**: AI agents with specialized roles work together
- **Real-Time Updates**: WebSockets provide live updates on agent activities
- **Interactive Code Editor**: Monaco-based editor with syntax highlighting
- **File Explorer**: Navigate and manage project files
- **Version Control**: Create and restore project snapshots
- **Activity Logs**: Track agent actions and project history

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
