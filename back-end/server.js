const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Connect to MySQL
require("./config/db");

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