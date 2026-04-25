// ============================================================
// Launchmen Task API
// Developer Candidate Test — Trial 2
// ============================================================
// Instructions:
//   Run with: npm install && node server.js
//   Server starts on: http://localhost:3000
// ============================================================

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, "tasks.json");

function loadTasks() {
  if (!fs.existsSync(DB_FILE)) return [];
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveTasks(tasks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// GET /tasks
// Returns all tasks. Supports optional status filter.
app.get("/tasks", (req, res) => {
  const tasks = loadTasks();
  const { status } = req.query;
  if (status) {
    const filtered = tasks.filter((t) => t.status === status);
    return res.json({ success: true, tasks: filtered });
  }
  res.json({ success: true, tasks });
});

// POST /tasks
app.post("/tasks", (req, res) => {
  const { title, status } = req.body;

  if (!title.trim() || title === "")
    return res.status(400).json({
      error: "Validation Failed",
      message: "Title is required",
    });

  const tasks = loadTasks();
  const newTask = {
    id: Date.now(),
    title: title,
    status: !status.trim() || title === "" ? "pending" : status,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  res.json({ success: true, task: newTask });
});

// PATCH /tasks/:id
app.patch("/tasks/:id", (req, res) => {
  const tasks = loadTasks();
  const { status } = req.body;

  console.log(req.params.id);
  const task = tasks.find((t) => t.id === parseInt(req.params.id));
  console.log(task);
  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }
  task.status = status;
  saveTasks(tasks);
  res.json({ success: true, task });
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  let tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === parseInt(req.params.id));
  tasks.splice(index, 1);
  saveTasks(tasks);
  res.json({ success: true, message: "Task deleted" });
});

app.listen(3000, () => {
  console.log("Launchmen Task API running on http://localhost:3000");
});

/* Questions
1. **Identify the issue.** What performance problem does this code have?
2. **How you can fix.**

## Answer

1. **The Problem**: Using a loop to get the authors from db than using table JOINS in query directly, when you query every iteration, the database latency adds up. Each trip across the network creates overhead, as the LIMIT grows or traffic increases, the database will struggle to handle the spike in connections.
2. **How you can fix.** Update the query
   SELECT
   p.id,
   p.author_id,
   p.title,
   p.created_at,
   a.name AS author_name,
   a.email AS author_email
   FROM posts p
   JOIN authors a ON p.author_id = a.id
   ORDER BY p.created_at DESC
   LIMIT 50;

**Additionally** For optimization, we can add indexes to make the database search faster.
*/
