import express from "express";
import cors from "cors";
import pkg from 'pg';
const { Pool } = pkg; 

const app = express();
const port = 5000;

// PostgreSQL configuration
const pool = new Pool({
  user: "postgres", // Replace with your DB username
  host: "localhost",
  database: "cyber_incidents", // Replace with your database name
  password: "root123", // Replace with your DB password
  port: 5432, // Default PostgreSQL port
});

// Middleware
app.use(cors());
app.use(express.json());

// Default route for root URL
app.get("/", (req, res) => {
  res.send("Welcome to the CyberScope API! Use /api/incidents to fetch data.");
});

// Route to fetch all incidents
app.get("/api/incidents", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, text, url, to_char(timestamp, 'YYYY-MM-DD') AS date FROM incidents ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
