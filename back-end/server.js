
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Connect to MySQL
require("./config/db");

const reminderJob = require("./jobs/generateReminders");

app.get("/api/clients/reminders/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(": connected\n\n");

    const onReminderGenerated = () => {
        res.write(`event: reminder-generated\ndata: {}\n\n`);
    };

    reminderJob.reminderEvents.on("reminder-generated", onReminderGenerated);

    req.on("close", () => {
        reminderJob.reminderEvents.off("reminder-generated", onReminderGenerated);
    });
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "front-end")));

// API routes
const clientRoutes = require("./routes/clients");
app.use("/api/clients", clientRoutes);

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "front-end/index.html"));
});



// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});