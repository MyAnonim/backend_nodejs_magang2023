import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import DroneRoute from "./routes/DroneRoute.js";
import UsersRoute from "./routes/UsersRoute.js";
import TokenRoute from "./routes/TokenRoute.js";
import LogsRoute from "./routes/LogsRoute.js";

dotenv.config();

const app = express();

//midleware
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(LogsRoute);
app.use(DroneRoute);
app.use(UsersRoute);
app.use(TokenRoute);

app.listen(process.env.APP_PORT, () => {
  console.log("Server up and running in port 5001");
});
