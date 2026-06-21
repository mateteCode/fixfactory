import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { initCronJobs } from "./services/cron.service.js";
import { initAgendaCronJobs } from "./services/agenda-cron.service.js";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  initCronJobs();
  initAgendaCronJobs();
  app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
  });
});
