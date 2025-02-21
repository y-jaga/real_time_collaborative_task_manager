require("./db/init.js");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoute = require("./routes/auth.js");
const todoRoute = require("./routes/todo.js");
const collaboratorRoutes = require("./routes/collaborator.js");
const { authenticateJWT } = require("./middleware/authenticateJWT.js");

const app = express();


//Create a http server
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());

// Initializes a socket.io server instance
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  //Listen for task creation event from a client
  socket.on("taskCreated", async (task) => {
    console.log("Task created:", task);

    //Broadcast the event to all other clients except the sender
    socket.broadcast.emit("taskCreated", task);
  });

  //Listen for task updation
  socket.on("taskUpdated", async (task) => {
    console.log("Task updated:", task);

    socket.broadcast.emit("taskUpdated", task);
  });

  //Listen for task deletion
  socket.on("taskDeleted", async (task) => {
    console.log("Task deleted:", task);

    socket.broadcast.emit("taskDeleted", task);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

//Public Routes: No authentication required here
app.use("/auth", authRoute);

//JWT authentication middleware applied "/todos" route.
//This means that any request to /todos must include a valid token in the Authorization header (e.g., Bearer <token>).
//If the token is valid, the middleware attaches the decoded user information (like _id) to req.user before passing control to the route handler.

//todos routes
app.use("/todos", authenticateJWT, todoRoute);

//collaborator routes
app.use("/api/todos", authenticateJWT, collaboratorRoutes);

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
