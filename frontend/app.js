const API_URL = "/api/tasks";

const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");


/*
|--------------------------------------------------------------------------
| Load Tasks
|--------------------------------------------------------------------------
*/

async function loadTasks() {

    try {

        const response = await fetch(API_URL);

        const tasks = await response.json();

        renderTasks(tasks);

    } catch (error) {

        showMessage("Unable to connect to TaskFlow API");

        console.error(error);
    }
}


/*
|--------------------------------------------------------------------------
| Render Tasks
|--------------------------------------------------------------------------
*/

function renderTasks(tasks) {

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <p class="empty-message">
                No tasks yet.
            </p>
        `;

        return;
    }


    tasks.forEach(task => {

        const taskElement = document.createElement("div");

        taskElement.className =
            task.completed ? "task completed" : "task";


        taskElement.innerHTML = `

            <div class="task-info">

                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask('${task.id}', ${task.completed})"
                >

                <span class="task-title">
                    ${escapeHtml(task.title)}
                </span>

            </div>


            <div class="task-actions">

                <button onclick="deleteTask('${task.id}')">
                    Delete
                </button>

            </div>

        `;


        taskList.appendChild(taskElement);

    });
}


/*
|--------------------------------------------------------------------------
| Add Task
|--------------------------------------------------------------------------
*/

async function addTask() {

    const title = taskInput.value.trim();


    if (!title) {

        showMessage("Please enter a task.");

        return;
    }


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title
            })

        });


        if (!response.ok) {

            throw new Error("Failed to create task");

        }


        taskInput.value = "";

        showMessage("");

        await loadTasks();


    } catch (error) {

        showMessage("Failed to create task.");

        console.error(error);
    }
}


/*
|--------------------------------------------------------------------------
| Toggle Task Status
|--------------------------------------------------------------------------
*/

async function toggleTask(id, currentStatus) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                completed: !currentStatus
            })

        });


        if (!response.ok) {

            throw new Error("Failed to update task");

        }


        await loadTasks();


    } catch (error) {

        showMessage("Failed to update task.");

        console.error(error);
    }
}


/*
|--------------------------------------------------------------------------
| Delete Task
|--------------------------------------------------------------------------
*/

async function deleteTask(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "DELETE"

        });


        if (!response.ok) {

            throw new Error("Failed to delete task");

        }


        await loadTasks();


    } catch (error) {

        showMessage("Failed to delete task.");

        console.error(error);
    }
}


/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

function showMessage(text) {

    message.textContent = text;
}


function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/*
|--------------------------------------------------------------------------
| Event Listeners
|--------------------------------------------------------------------------
*/

addTaskButton.addEventListener("click", addTask);


taskInput.addEventListener("keypress", event => {

    if (event.key === "Enter") {

        addTask();

    }

});


/*
|--------------------------------------------------------------------------
| Initial Load
|--------------------------------------------------------------------------
*/

loadTasks();