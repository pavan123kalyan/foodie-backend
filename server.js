// models for mongodb database
// controllers --> logic for backend

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import 'dotenv/config.js'
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoute.js"; // <--- NEW: Import adminRouter

//app config
const app=express()
const port=4000

//middleware,whenever we get request fron frontend to backend ,that will be parsed using json

app.use(express.json())
app.use(cors()) //using this we can access backend from frontend

//db connection
connectDB();

//api endpoints
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))

app.use("/api/user",userRouter)

app.use("/api/cart",cartRouter)

app.use("/api/order",orderRouter)

app.use("/api/admin", adminRouter); // <--- NEW: Mount adminRouter


app.get("/",(req,res)=>{
    res.send("API WORKING")
})

app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`);

})
