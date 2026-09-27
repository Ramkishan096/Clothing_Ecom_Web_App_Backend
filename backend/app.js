import express from "express";
import cors from "cors";
import AllRoutes from "./index.js";
import cookieParser from "cookie-parser";
import { globalLimiter } from "./modules/userAuth/middlewares/rateLimiter.js";

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://shopping-web-app-frontend-seven.vercel.app",      
      "https://blackstudios.in",
      "https://www.blackstudios.in"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Routes

app.use("/api/v1",globalLimiter, AllRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running version 1.0");
});
setInterval(
  () => {
    fetch("https://shopping-web-app-backend.onrender.com")
      .then((res) => console.log("ping success"))
      .catch((err) => console.log("ping failed"));
  },
  5 * 60 * 1000,
); // 5 min

export default app;
