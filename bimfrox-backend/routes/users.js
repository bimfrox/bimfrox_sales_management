import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const verifyAdmin = (req,res,next)=>{
  const token = req.header("Authorization")?.split(" ")[1];
  if(!token) return res.status(401).json({msg:"No token"});

  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  if(decoded.role !== "admin") return res.status(403).json({msg:"Admin only"});

  req.user = decoded;
  next();
};

// Get all salespersons
router.get("/", verifyAdmin, async (req,res)=>{
  const users = await User.find({role:"sales",status:"approved"}).select("-password");
  res.json(users);
});

// Get single salesperson by ID
router.get("/:id", verifyAdmin, async (req,res)=>{
  const user = await User.findById(req.params.id).select("-password");
  if(!user) return res.status(404).json({msg:"User not found"});
  res.json(user);
});

export default router;