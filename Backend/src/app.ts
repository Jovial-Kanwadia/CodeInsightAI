import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
import userRouter from '../src/routes/user.routes.js'
import readRouter from '../src/routes/read.routes.js'
import 'dotenv/config';
// dotenv.config({
//     path: './.env'
// });
const app: Application = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter)
app.use("/api/v1/readData", readRouter)

export { app };
