import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PropertyHub API is running"
  });
});

export default app;