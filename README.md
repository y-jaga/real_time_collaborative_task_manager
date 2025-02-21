# 🚀 Real-Time Collaborative Task Manager

A full-stack Node.js application that enables multiple users to create, update, share, and manage tasks in real time using Socket.io. This project features user authentication, a RESTful API for tasks, and real-time updates.

## ✨ Features

- **🔒 User Authentication:** Secure login and registration using JWT.
- **📝 Task Management:** Create, read, update, and delete tasks.
- **🤝 Task Collaboration:** Share tasks with other users.
- **⚡ Real-Time Updates:** Socket.io broadcasts task events (`taskCreated`, `taskUpdated`, `taskDeleted`) to all connected clients.
- **🔧 Environment Configuration:** Use different environment settings for development.


## 🔧 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/my-project.git
   cd my-project

2. **Install dependencies:**

npm install

## 🌐 Environment Variables

- MONGO_URI=your_mongo_db_connection_string
- JWT_SECRET=jwt_secret_key
- PORT=5001

## ▶️ Running the Application

npm start  
The server will start on the specified port (e.g., http://localhost:5001).

## 🔌 API Endpoints
## Authentication Routes
- POST /api/auth/register: Register a new user.
- POST /api/auth/login: Authenticate and return a JWT.
## To-Do Routes
- POST /api/todos: Create a new task.
- GET /api/todos: Fetch all tasks where the logged-in user is either the creator or assigned authenticate via JWT.
- PUT /api/todos/:id: Update an existing task only by creator authenticate via JWT.
- DELETE /api/todos/:id: Delete a task nly by creator authenticate via JWT.
## Collaboration Routes
- POST /api/todos/:id/share: Share a task with another user.
- GET /api/todos/shared: Fetch tasks that have been shared with the logged-in user.

## 💬 Real-Time Updates with Socket.io
The application uses Socket.io for real-time communication between the server and clients.

Server-Side (in server.js)
The server broadcasts events such as:

- taskCreated
- taskUpdated
- taskDeleted
