const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");


const app = express();

const PORT = process.env.PORT || 3000;

const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const TABLE_NAME =
    process.env.TABLE_NAME || "taskflow-dev-tasks";


app.use(cors());
app.use(express.json());


/*
|--------------------------------------------------------------------------
| DynamoDB Client
|--------------------------------------------------------------------------
*/

const dynamoClient = new DynamoDBClient({
    region: AWS_REGION
});

const docClient =
    DynamoDBDocumentClient.from(dynamoClient);


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

app.get("/api/tasks", async (req, res) => {

    try {

        const command = new ScanCommand({
            TableName: TABLE_NAME
        });


        const response =
            await docClient.send(command);


        const tasks =
            response.Items || [];


        tasks.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );


        res.status(200).json(tasks);


    } catch (error) {

        console.error(
            "Get tasks error:",
            error
        );


        res.status(500).json({
            error: "Failed to retrieve tasks"
        });

    }

});


/*
|--------------------------------------------------------------------------
| Create Task
|--------------------------------------------------------------------------
*/

app.post("/api/tasks", async (req, res) => {

    try {

        const { title } = req.body;


        if (!title || title.trim() === "") {

            return res.status(400).json({
                error: "Task title is required"
            });

        }


        const task = {

            taskId: crypto.randomUUID(),

            title: title.trim(),

            completed: false,

            createdAt:
                new Date().toISOString()

        };


        const command = new PutCommand({

            TableName: TABLE_NAME,

            Item: task

        });


        await docClient.send(command);


        res.status(201).json(task);


    } catch (error) {

        console.error(
            "Create task error:",
            error
        );


        res.status(500).json({
            error: "Failed to create task"
        });

    }

});


/*
|--------------------------------------------------------------------------
| Update Task
|--------------------------------------------------------------------------
*/

app.patch("/api/tasks/:id", async (req, res) => {

    try {

        const updateParts = [];

        const attributeNames = {};

        const attributeValues = {};


        if (req.body.title !== undefined) {

            updateParts.push(
                "#title = :title"
            );

            attributeNames["#title"] =
                "title";

            attributeValues[":title"] =
                req.body.title.trim();

        }


        if (req.body.completed !== undefined) {

            updateParts.push(
                "#completed = :completed"
            );

            attributeNames["#completed"] =
                "completed";

            attributeValues[":completed"] =
                req.body.completed;

        }


        if (updateParts.length === 0) {

            return res.status(400).json({
                error: "No valid fields to update"
            });

        }


        updateParts.push(
            "#updatedAt = :updatedAt"
        );

        attributeNames["#updatedAt"] =
            "updatedAt";

        attributeValues[":updatedAt"] =
            new Date().toISOString();


        const command = new UpdateCommand({

            TableName: TABLE_NAME,

            Key: {
                taskId: req.params.id
            },

            UpdateExpression:
                `SET ${updateParts.join(", ")}`,

            ExpressionAttributeNames:
                attributeNames,

            ExpressionAttributeValues:
                attributeValues,

            ConditionExpression:
                "attribute_exists(taskId)",

            ReturnValues:
                "ALL_NEW"

        });


        const response =
            await docClient.send(command);


        res.status(200).json(
            response.Attributes
        );


    } catch (error) {

        if (
            error.name ===
            "ConditionalCheckFailedException"
        ) {

            return res.status(404).json({
                error: "Task not found"
            });

        }


        console.error(
            "Update task error:",
            error
        );


        res.status(500).json({
            error: "Failed to update task"
        });

    }

});


/*
|--------------------------------------------------------------------------
| Delete Task
|--------------------------------------------------------------------------
*/

app.delete("/api/tasks/:id", async (req, res) => {

    try {

        const command = new DeleteCommand({

            TableName: TABLE_NAME,

            Key: {
                taskId: req.params.id
            },

            ReturnValues:
                "ALL_OLD"

        });


        const response =
            await docClient.send(command);


        if (!response.Attributes) {

            return res.status(404).json({
                error: "Task not found"
            });

        }


        res.status(200).json(
            response.Attributes
        );


    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );


        res.status(500).json({
            error: "Failed to delete task"
        });

    }

});


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `TaskFlow API running on port ${PORT}`
    );

    console.log(
        `DynamoDB table: ${TABLE_NAME}`
    );

    console.log(
        `AWS Region: ${AWS_REGION}`
    );

});