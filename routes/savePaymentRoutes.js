// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth"); // تحقق من تسجيل الدخول

// POST /api/pay
router.post("/internet", authMiddleware, async (req, res) => {
  try {
    const { landline, company, speed, amount ,email} = req.body;
    const userId = req.user.id;
    

    // خصم الرصيد من حساب المستخدم
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    if (user.balance < amount) {
      return res.status(400).json({ message: "الرصيد غير كافٍ" });
    }

    // حفظ عملية الدفع
    const payment = new Payment({
      user: userId,
      landline,
      company,
      speed,
      amount,
      email, 


    });

    await payment.save();

    res.status(200).json({ message: "تمت العملية بنجاح", newBalance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

module.exports = router;
