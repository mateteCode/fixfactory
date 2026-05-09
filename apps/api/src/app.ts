import express from "express";
import cors from "cors";
import machineRoutes from "./routes/machine.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import preventiveRoutes from "./routes/preventive.routes.js";
import sparePartRoutes from "./routes/sparePart.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import companyRoutes from "./routes/company.routes.js";

const app = express();
console.log("TEST");

// Middlewares
app.use(cors());
app.use(express.json());

// RUTA DE DIAGNÓSTICO
app.get("/api/test", (req, res) => {
  res.send("API is working");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/preventive", preventiveRoutes);
app.use("/api/spare-parts", sparePartRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/company", companyRoutes);

export default app;
