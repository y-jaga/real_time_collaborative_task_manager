require("dotenv").config();
const request = require("supertest");
const { app } = require("../index");
const dbHandler = require("./dbHandler");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

//Connect to a in-memory database before running any tests.
beforeAll(async () => await dbHandler.dbConnect());

//Disconnect from in-memory database after running tests.
afterAll(async () => await dbHandler.dbDisconnect());

describe("Authentication Route Test", () => {
  //Clear all test data after every running all test of this block.
  afterAll(async () => await dbHandler.clearDatabase());

  it("POST /auth/register, should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "ankit",
      email: "ankit@example.com",
      password: "ankit123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.username).toEqual("ankit");
    expect(res.body.message).toEqual("User registered successfully");
  });

  it("POST /auth/register, should return status 400 when mendatory fields not provided.", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "ankit@example.com",
      password: "ankit123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toEqual(
      "All fields are required username, email, password"
    );
  });

  it("POST /auth/register, should return status 400 when user already exists.", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "ankit",
      email: "ankit@example.com",
      password: "ankit123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toEqual("User already exists. Please login");
  });

  it("POST /auth/login, should login a user successfully.", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "ankit@example.com", password: "ankit123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toEqual("Login successfull");
    expect(res.body.username).toEqual("ankit");
    expect(res.body).toHaveProperty("token");
  });

  it("POST /auth/login, should return 404 not found status when user not registered.", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "suresh@example.com",
      password: "suresh123",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toEqual("User not found. Please register");
  });

  it("POST /auth/login, should return 400 invalid credentials error on wrong password.", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "ankit@example.com", password: "ankit" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toEqual("Invalid credentials.");
  });
});

describe("ToDo Route Test", () => {
  //Clear all test data after every running all test of this block.
  afterAll(async () => await dbHandler.clearDatabase());

  // Generate a JWT token
  const token = jwt.sign({ _id: "67b574490cd72e755f2d16f8" }, JWT_SECRET, {
    expiresIn: "4h",
  });

  it("POST /todos, should create a new task.", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete real time collaborative to do list",
        status: "pending",
        createdBy: "67b574490cd72e755f2d16f8",
        assignedUser: ["67b4209a2c2fe6bc5eef589f"],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toEqual("Todo created successfully");
    expect(res.body.newTodo).toHaveProperty("_id");
  });

  it("POST /todos, should return 400 missing required filed error", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "pending",
        createdBy: "67b574490cd72e755f2d16f8",
        assignedUser: ["67b4209a2c2fe6bc5eef589f"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toEqual(
      "Missing required field title and createdby."
    );
  });

  it("GET /todos, fetch all tasks related to the logged-in user.", async () => {
    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    res.body.forEach((todo) => {
      expect(todo).toHaveProperty("_id");
    });
  });

  it("GET /todos, should return 404 if user has no task assigned.", async () => {
    const newToken = jwt.sign({ _id: "67b4209a2c2fe6bc5eef5897" }, JWT_SECRET, {
      expiresIn: "4h",
    });

    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${newToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toEqual("No tasks assigned or created.");
  });

  it("PUT /todos/:id, should update a task.", async () => {
    const tempRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete new task",
        status: "pending",
        createdBy: "67b574490cd72e755f2d16f8",
        assignedUser: ["67b4209a2c2fe6bc5eef589f"],
      });

    const taskId = tempRes.body.newTodo._id;

    const res = await request(app)
      .put(`/todos/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete second new task.",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.updatedUser.title).toEqual("Complete second new task.");
  });

  it("PUT /todos/:id, should return 401 not authorized error", async () => {
    const tempRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete new task",
        status: "pending",
        createdBy: "67b574490cd72e755f2d16f8",
        assignedUser: ["67b4209a2c2fe6bc5eef589f"],
      });

    const taskId = tempRes.body.newTodo._id;
    const tempToken = jwt.sign(
      { _id: "67b4209a2c2fe6bc5eef589f" },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    const res = await request(app)
      .put(`/todos/${taskId}`)
      .set("Authorization", `Bearer ${tempToken}`)
      .send({
        title: "Complete second new task.",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toEqual(
      "Not authorized to update the task. Only tasks creators allowed to updated."
    );
  });

  it("PUT /todos/:id, should return 404 task not found.", async () => {
    const res = await request(app)
      .put("/todos/67b575130cd72e755f2d16fc")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete second new task.",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toEqual("Task not found.");
  });

  it("DELETE /todos/:id should delete a task successfully", async () => {
    const tempRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete new task",
        status: "pending",
        createdBy: "67b574490cd72e755f2d16f8",
        assignedUser: ["67b4209a2c2fe6bc5eef589f"],
      });

    const taskId = tempRes.body.newTodo._id;

    const res = await request(app)
      .delete(`/todos/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });

  it("DELETE /todos/:id should return 403 not authorized error.", async () => {
    const tempRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete new task",
        status: "pending",
        createdBy: "67b574490cd72e755f2d16f8",
        assignedUser: ["67b4209a2c2fe6bc5eef589f"],
      });

    const taskId = tempRes.body.newTodo._id;
    const tempToken = jwt.sign(
      { _id: "67b4209a2c2fe6bc5eef589f" },
      JWT_SECRET,
      { expiresIn: "4h" }
    );
    const res = await request(app)
      .delete(`/todos/${taskId}`)
      .set("Authorization", `Bearer ${tempToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toEqual("Not authorized to delete the task.");
  });

  it("DELETE /todos/:id should return 404 task not found.", async () => {
    const res = await request(app)
      .delete("/todos/67b575130cd72e755f2d16fc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toEqual("Task not found.");
  });
});

describe("Collaborator Route Tests", () => {
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });
  const token = jwt.sign({ _id: "67b574490cd72e755f2d16f8" }, JWT_SECRET, {
    expiresIn: "4h",
  });

  it("POST /api/todos/:id/share, should share task with user", async () => {
    const task = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete real time collaborative to do list",
        status: "pending",
        createdBy: "67b574490cd72e755f2d16f8",
        assignedUser: ["67b4209a2c2fe6bc5eef589f"],
      });

    const taskId = task.body.newTodo._id;

    const res = await request(app)
      .post(`/api/todos/${taskId}/share`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: "67b4209a2c2fe6bc5eef589f", role: "collaborator" });

    expect(res.statusCode).toBe(201);
    expect(res.body.newCollaborator).toHaveProperty("_id");
    expect(res.body.message).toEqual("Task shared successfully.");
  });

  it("POST /api/todos/:id/share, should return 404 task doesn't exists.", async () => {
    const res = await request(app)
      .post("/api/todos/67b575130cd72e755f2d16fc/share")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: "67b4209a2c2fe6bc5eef589f", role: "collaborator" });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toEqual("Task doesn't exists.");
  });

  it("POST /api/todos/:id/share, should return 403 not authorized error", async () => {
    const task = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete real time collaborative to do list",
        status: "pending",
        createdBy: "67b4209a2c2fe6bc5eef589f",
        assignedUser: ["67b574490cd72e755f2d16f8"],
      });

    const taskId = task.body.newTodo._id;

    const res = await request(app)
      .post(`/api/todos/${taskId}/share`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: "67b4209a2c2fe6bc5eef589f", role: "collaborator" });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toEqual("Not authorized to share the task.");
  });

  it("GET /api/todos/shared, should fetch tasks that have been shared with logged-in user", async () => {
    const tempToken = jwt.sign(
      { _id: "67b4209a2c2fe6bc5eef589f" },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    const task = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete real time collaborative to do list",
        status: "pending",
        createdBy: "67b574490cd72e755f2d16f8",
        assignedUser: ["67b4209a2c2fe6bc5eef589f"],
      });

    const taskId = task.body.newTodo._id;

    await request(app)
      .post(`/api/todos/${taskId}/share`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: "67b4209a2c2fe6bc5eef589f", role: "collaborator" });

    const res = await request(app)
      .get("/api/todos/shared")
      .set("Authorization", `Bearer ${tempToken}`);

    expect(res.statusCode).toBe(200);
    res.body.collaborations.forEach((collaboration) => {
      expect(collaboration).toHaveProperty("_id");
    });
  });

  it("GET /api/todos/shared, should return 404 no task shared", async () => {
    const res = await request(app)
      .get("/api/todos/shared")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toEqual("No tasks shared.");
  });
});
