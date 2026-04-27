import express from "express";
import cors from "cors";
import machineRoutes from "./routes/machine.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import preventiveRoutes from "./routes/preventive.routes.js";
import sparePartRoutes from "./routes/sparePart.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// RUTA DE DIAGNÓSTICO
app.get("/api/test", (req, res) => {
  res.send("API is working");
});

// Routes
app.use("/api/machines", machineRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/preventive", preventiveRoutes);
app.use("/api/spare-parts", sparePartRoutes);

export default app;
