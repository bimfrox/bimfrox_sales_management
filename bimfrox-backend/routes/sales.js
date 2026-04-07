import express from "express";
import Sale from "../models/Sale.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL SALES (Admin) or My Sales (Salesperson)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let sales;
    if (req.user.role === "admin") {
      sales = await Sale.find().populate("salespersonId").sort({ date: -1 });
    } else {
      sales = await Sale.find({ salespersonId: req.user.id })
        .populate("salespersonId")
        .sort({ date: -1 });
    }
    res.json(sales);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// ADD SALE
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { businessName, ownerName, contact, address, subscriptionPlan, amount } = req.body;

    const sale = new Sale({
      salespersonId: req.user.id,
      businessName,
      ownerName,
      contact,
      address,
      subscriptionPlan,
      amount, // revenue amount
      status: "pending"
    });

    await sale.save();
    res.json(sale);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// CONFIRM SALE
router.put("/confirm/:id", authMiddleware, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed" },
      { new: true }
    );
    res.json(sale);
  } catch (err) {
    res.status(500).json(err);
  }
});

// REJECT SALE
router.put("/reject/:id", authMiddleware, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json(sale);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET CONFIRMED REVENUE (for salesperson)
router.get("/revenue", authMiddleware, async (req, res) => {
  try {
    const confirmedSales = await Sale.find({
      salespersonId: req.user.id,
      status: "confirmed"
    });

    const totalRevenue = confirmedSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

    res.json({ revenue: totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

export default router;