// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/payment/internet
router.post("/internet", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "قيمة غير صالحة" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const amountToDeduct = parseFloat((amount * 1.05).toFixed(2));

    if (user.balance < amountToDeduct) {
      return res.status(400).json({ message: "الرصيد غير كافٍ" });
    }

    user.balance -= amountToDeduct;
    await user.save();

    res.json({ message: "تمت العملية بنجاح", newBalance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء العملية" });
  }
});

module.exports = router;
