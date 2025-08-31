[README.md](https://github.com/user-attachments/files/22064108/README.md)
# ChatApp - Real-time Messaging Application

A full-stack chat application with individual and group chat functionality, built with Flask (backend) and React (frontend), featuring real-time communication via WebSockets.

## Features

- **User Authentication**: Register and login with secure password hashing
- **Direct Messaging**: One-on-one conversations with other users
- **Group Chat**: Create and join group conversations
- **Real-time Communication**: Instant message delivery using WebSockets
- **Responsive Design**: Works on desktop and mobile devices
- **Online Status**: See who's currently online
- **Message History**: Persistent message storage

## Prerequisites

Before running the application, ensure you have the following installed on your laptop:

- **Python 3.8+** (with pip)
- **Node.js 16+** (with npm or pnpm)
- **Git** (optional, for version control)

## Installation and Setup

### 1. Download the Application

If you received this as a zip file, extract it to your desired location. If using git:

```bash
git clone <repository-url>
cd chat_app
```

### 2. Backend Setup (Flask)

Navigate to the backend directory and set up the Python environment:

```bash
cd backend

# Create and activate virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Create and activate virtual environment (macOS/Linux)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup (React)

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend

# Install dependencies using npm
npm install

# OR using pnpm (if you have it installed)
pnpm install
```

### 4. Build Frontend for Production

Build the React application for production:

```bash
# Using npm
npm run build

# OR using pnpm
pnpm run build
```

### 5. Copy Frontend Build to Backend

Copy the built frontend files to the Flask static directory:

```bash
# From the chat_app root directory
cp -r frontend/dist/* backend/src/static/

# On Windows, use:
# xcopy frontend\dist\* backend\src\static\ /E /I /Y
```

## Running the Application

### Option 1: Production Mode (Recommended)

1. Navigate to the backend directory:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Start the Flask server:
```bash
python src/main.py
```

3. Open your web browser and go to: `http://localhost:5000`

### Option 2: Development Mode

For development with hot-reload:

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python src/main.py
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev  # or pnpm run dev
```

3. Open your browser to: `http://localhost:5173` (frontend dev server)

## Usage Instructions

### Getting Started

1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Start Chatting**: 
   - Click "New Chat" to start a direct message with another user
   - Click "New Group" to create a group chat
   - Select existing conversations from the sidebar

### Features Guide

- **Direct Messages**: Search for users and start one-on-one conversations
- **Group Chats**: Create groups, add members, and chat with multiple people
- **Real-time Updates**: Messages appear instantly without refreshing
- **Message History**: All conversations are saved and accessible
- **Online Status**: See when users are online (green badge)

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - If port 5000 is busy, edit `backend/src/main.py` and change the port number
   - Update the frontend proxy configuration in `frontend/vite.config.js` accordingly

2. **Database Issues**
   - Delete `backend/src/database/app.db` to reset the database
   - Restart the application to recreate tables

3. **Frontend Build Issues**
   - Delete `frontend/node_modules` and run `npm install` again
   - Clear browser cache and cookies

4. **WebSocket Connection Issues**
   - Ensure both frontend and backend are running
   - Check browser console for connection errors
   - Verify firewall settings aren't blocking connections

### Performance Tips

- **For better performance**: Use production mode (Option 1)
- **For development**: Use development mode (Option 2) with hot-reload
- **Database**: For production use, consider upgrading from SQLite to PostgreSQL

## Technical Architecture

- **Backend**: Flask with Flask-SocketIO for WebSocket support
- **Frontend**: React with Socket.IO client for real-time communication
- **Database**: SQLite (development) - easily upgradeable to PostgreSQL
- **Authentication**: Session-based with secure password hashing
- **Real-time**: WebSocket rooms for direct and group messaging

## Security Features

- Password hashing using Werkzeug security utilities
- Session-based authentication
- CORS protection
- Input validation and sanitization
- SQL injection prevention through ORM

## File Structure

```
chat_app/
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── static/          # Frontend build files
│   │   ├── database/        # SQLite database
│   │   └── main.py         # Application entry point
│   ├── venv/               # Python virtual environment
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.jsx        # Main React component
│   ├── dist/              # Production build
│   └── package.json       # Node.js dependencies
└── README.md              # This file
```

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure all installation steps were followed
4. Check browser console and terminal for error messages

## License

This project is provided as-is for educational and personal use.

