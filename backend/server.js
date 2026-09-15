const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let tasks = [];


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "taskflow-api",
        timestamp: new Date().toISOString()
    });
});


/*
|--------------------------------------------------------------------------
| Get All Tasks
|--------------------------------------------------------------------------
*/

app.get("/api/tasks", (req, res) => {
    res.status(200).json(tasks);
});


/*
|--------------------------------------------------------------------------
| Create Task
|--------------------------------------------------------------------------
*/

app.post("/api/tasks", (req, res) => {

    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    const task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);

    res.status(201).json(task);
});


/*
|--------------------------------------------------------------------------
| Update Task
|--------------------------------------------------------------------------
*/

app.patch("/api/tasks/:id", (req, res) => {

    const task = tasks.find(
        task => task.id === req.params.id
    );

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    if (req.body.title !== undefined) {
        task.title = req.body.title;
    }

    if (req.body.completed !== undefined) {
        task.completed = req.body.completed;
    }

    res.status(200).json(task);
});


/*
|--------------------------------------------------------------------------
| Delete Task
|--------------------------------------------------------------------------
*/

app.delete("/api/tasks/:id", (req, res) => {

    const taskIndex = tasks.findIndex(
        task => task.id === req.params.id
    );

    if (taskIndex === -1) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.status(200).json(deletedTask[0]);
});


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
    console.log(`TaskFlow API running on port ${PORT}`);
});