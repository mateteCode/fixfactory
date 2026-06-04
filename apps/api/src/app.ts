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
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

//app.use(cors());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // El origen del frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Permitir cookies o headers de autenticación
    optionsSuccessStatus: 200, // Algunas versiones de navegadores antiguos fallan con el 204 por defecto
  }),
);
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
app.use("/api/notifications", notificationRoutes);

export default app;
