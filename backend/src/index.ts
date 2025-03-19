import express from "express"
import cors from "cors"
import { userRoute } from "./routes/user"
import { pdfRoute } from "./routes/pdf"

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/v1/user", userRoute);
app.use("/api/v1/pdf", pdfRoute);

app.listen("3001", () => {
  console.log("Sever running on port 3001")
})