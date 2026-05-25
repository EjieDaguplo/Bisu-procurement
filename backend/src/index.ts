import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { router } from "./routes";
import { errorMiddleware } from "./middleware/error-middleware";
import { authMiddleware } from "./middleware/auth-middleware";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_PASS:", process.env.MAIL_PASS);

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

// Add this temporarily for testing
router.get("/test-email", authMiddleware, async (req, res) => {
  try {
    const { sendMail } = await import("./services/mail-service");
    await sendMail({
      to: "ejiedaguplo06@gmail.com",
      subject: "BISU Procurement — Email Test",
      html: "<h2>✅ Email is working!</h2><p>Your nodemailer config is correct.</p>",
    });
    return res.json({ message: "Test email sent! Check your inbox." });
  } catch (err) {
    console.error("TEST EMAIL ERROR:", err);
    return res
      .status(500)
      .json({ message: "Email failed", error: String(err) });
  }
});

app.use(errorMiddleware);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 BISU Procurement API running on port ${PORT}`);
});

export default app;
