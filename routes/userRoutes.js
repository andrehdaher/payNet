// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/user/balance
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ داخلي" });
  }
});

module.exports = router;
