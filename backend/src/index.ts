import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { router } from "./routes";
import { errorMiddleware } from "./middleware/error-middleware";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = ["http://localhost:3000", "http://192.168.43.43:3000"];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/v1", router);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 BISU Procurement API running on port ${PORT}`);
});

export default app;
