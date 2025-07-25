// routes/admin.js
const express = require("express");
const router = express.Router();
const InternetPayment = require("../models/Payment");
const authMiddleware = require("../middleware/authMiddleware");
const User = require('../models/User');
const Balance = require("../models/Balance");


router.get("/pending", async (req, res) => {
  const payments = await InternetPayment.find({ status:"جاري التسديد" });
    // إرسال التحديث عبر Socket.IO لكل العملاء
  const io = req.app.get("io");
  io.emit("pendingPaymentsUpdate", payments); // الاسم يمكن تغييره حسب الحاجة

  res.json(payments);
});

router.patch("/confirm/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await InternetPayment.findByIdAndUpdate(
    id,
    { status: "تم التسديد" },
    { new: true }
  );
  res.json(updated);
});

router.patch("/start/:id", async (req, res) => {
  const { id } = req.params;
  console.log({id})
  const updated = await InternetPayment.findByIdAndUpdate(
    id,
    { status: "بدء التسديد" },
    { new: true }
  );
  res.json(updated);
});


// ✅ فلترة العمليات حسب المستخدم
router.get("/user/confirmed", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await InternetPayment.find({
      user: userId,
  status: { $in: ["تم التسديد", "غير مسددة"] }
    });

    res.json(payments);
  } catch (error) {
    console.error("فشل في جلب عمليات المستخدم:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});
router.get("/user/allconfirmed", async (req, res) => {
  try {

    const payments = await InternetPayment.find({
  status: { $in: ["تم التسديد", "غير مسددة"] }
    });

    res.json(payments);
  } catch (error) {
    console.error("فشل في جلب عمليات المستخدم:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});


// تأكيد العملية وإضافة المبلغ إلى المستخدم
router.post("/confirm-payment", async (req, res) => {
  try {
    const { id, amount } = req.body;

    if (!id || !amount) {
      return res.status(400).json({ message: "البيانات غير مكتملة" });
    }

    // ابحث عن الدفعة المطلوبة
    const payment = await Balance.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "لم يتم العثور على الدفعة" });
    }

    // ابحث عن المستخدم
    const user = await User.findOne({ email: payment.name });
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // حدّث الرصيد وحالة التأكيد
    user.balance += amount;
    await user.save();

    payment.isConfirmed = true;
    await payment.save();

    res.status(200).json({ success: true, message: "تم تحديث رصيد المستخدم" });
  } catch (error) {
    console.error("خطأ أثناء تأكيد الدفعة:", error);
    res.status(500).json({ message: "حدث خطأ أثناء معالجة الطلب" });
  }
});






// ✅ فلترة العمليات حسب المستخدم
router.get("/user/pending", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await InternetPayment.find({
      user: userId,
  status: { $in: ["جاري التسديد"] }
    });

    res.json(payments);
  } catch (error) {
    console.error("فشل في جلب عمليات المستخدم:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});


// routes/admin.js
router.post("/reject/:id", async (req, res) => {
  try {
    const { reason, email, amount } = req.body;
    const paymentId = req.params.id;

    // 1. تحديث العملية إلى "غير مسددة" مع سبب
    await InternetPayment.findByIdAndUpdate(paymentId, {
      status: "غير مسددة",
      note: reason,
    });

    // 2. إرجاع الرصيد للمستخدم
    const user = await User.findOne({ email });
    if (user) {
      const Amount = amount + (amount*0.05)
      user.balance += Amount;
      await user.save();
    }

    res.status(200).json({ message: "تم الرفض وإرجاع الرصيد" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء الرفض" });
  }
});




module.exports = router; // هذا السطر مهم جداً
