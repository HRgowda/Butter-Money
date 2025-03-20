import express from "express";
import cors from "cors";
import path from "path";
import { userRoute } from "./routes/user";
import { pdfRoute } from "./routes/pdf";

const app = express();

const URL = process.env.FRONTEND_URL
app.use(cors({
  origin: URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/pdf", pdfRoute);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
