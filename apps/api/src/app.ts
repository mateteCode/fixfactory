import express from "express";
import cors from "cors";
import machineRoutes from "./routes/machine.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// RUTA DE DIAGNÓSTICO
app.get("/test", (req, res) => {
  res.send("API is working");
});

// Routes
app.use("/api/machines", machineRoutes);

export default app;
