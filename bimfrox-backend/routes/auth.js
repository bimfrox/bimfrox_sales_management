// routes/auth.js
import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// ===============================
// Middleware to verify logged-in user
// ===============================
const verifyUser = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id, username, role
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// ===============================
// Middleware to verify admin
// ===============================
const verifyAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ msg: "Admin only" });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// ===============================
// Register Sales Person
// ===============================
router.post("/register", async (req, res) => {
  const { username, password, city, phone, email } = req.body;
  if (!username || !password || !city)
    return res.status(400).json({ msg: "Username, password, and city are required" });

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const user = new User({
      username,
      password: hashed,
      role: "sales",
      status: "pending",
      city,
      phone,
      email,
    });

    await user.save();
    res.json({ msg: "Request sent to admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// Login
// ===============================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid password" });

    if (user.role === "sales") {
      if (user.status === "pending") return res.status(403).json({ msg: "Waiting for admin approval" });
      if (user.status === "rejected") return res.status(403).json({ msg: "Request rejected by admin" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        city: user.city,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// Create First Admin
// ===============================
router.post("/create-admin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await User.findOne({ role: "admin" });
    if (existing) return res.status(400).json({ msg: "Admin already exists" });

    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const admin = new User({ username, password: hashed, role: "admin", status: "approved" });
    await admin.save();
    res.json({ msg: "Admin created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// Admin - Get Pending Users
// ===============================
router.get("/pending-users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "sales", status: "pending" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// Admin - Approve User
// ===============================
router.put("/approve-user/:id", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.status = "approved";
    await user.save();
    res.json({ msg: "User approved" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// Admin - Reject User
// ===============================
router.put("/reject-user/:id", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.status = "rejected";
    await user.save();
    res.json({ msg: "User rejected" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// Admin - Get Approved Users
// ===============================
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "sales", status: "approved" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// Admin - Create Salesperson
// ===============================
router.post("/create-salesperson", verifyAdmin, async (req, res) => {
  const { username, password, city, phone, email } = req.body;
  if (!username || !password || !city)
    return res.status(400).json({ msg: "Username, password, and city are required" });

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user = new User({ username, password: hashed, role: "sales", status: "approved", city, phone, email });
    await user.save();
    res.json({ msg: "Sales person created", user: { username, role: "sales", city, phone, email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// User Profile - GET
// ===============================
router.get("/profile", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// User Profile - UPDATE
// ===============================
router.put("/profile", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const { username, city, email, phone } = req.body;
    if (username) user.username = username;
    if (city) user.city = city;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();
    res.json({ msg: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ===============================
// User Profile - DELETE
// ===============================
router.delete("/profile", verifyUser, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: "Profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;