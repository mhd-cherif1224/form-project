const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const app = express();

// Connect to MySQL
require("./config/db");

const reminderJob = require("./jobs/generateReminders");

app.get("/api/clients/reminders/events", (req, res) => {
    // ...unchanged...
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const requireAuth = require("./middleware/requireAuth");

// ADD THIS — catch "/" BEFORE static middleware, decide where to send them
app.get("/", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login/login.html");
    }
    res.sendFile(path.join(__dirname, "front-end/index.html"));
});

// ADD THIS — also guard direct requests to index.html itself
app.get("/index.html", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login/login.html");
    }
    res.sendFile(path.join(__dirname, "front-end/index.html"));
});

// CHANGED — { index: false } stops express.static from auto-serving index.html for "/"
app.use(express.static(path.join(__dirname, "front-end"), { index: false }));

const clientRoutes = require("./routes/clients");
app.use("/api/clients", requireAuth, clientRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});