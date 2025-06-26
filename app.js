import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from "cors";
import { dbConnection } from "./db/dbConnection.js";
import userRouter from "./routers/user.routers.js";

import { errorMiddleware } from "./middlewares/errorMiddlewares.js";


dotenv.config()



const app = express()




app.use(cors({
    origin: process.env.CORS_ORIGIN,
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


app.use("/app/v1/user", userRouter)



app.use(errorMiddleware)

const PORT = process.env.PORT || 4000

dbConnection()
app.listen(PORT, () =>{
    console.log(`Server is listening on http://localhost:${PORT}`);
})