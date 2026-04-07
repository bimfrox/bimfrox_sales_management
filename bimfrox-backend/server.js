import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import salesRoutes from "./routes/sales.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("MongoDB error:",err));

app.use("/api/auth",authRoutes);
app.use("/api/sales",salesRoutes);
app.use("/api/users",usersRoutes);

app.get("/",(req,res)=>{
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});