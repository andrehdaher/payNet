// routes/admin.js
const express = require("express");
const router = express.Router();
const InternetPayment = require("../models/Payment");
const authMiddleware = require("../middleware/authMiddleware");
const User = require('../models/User');
const Balance = require("../models/Balance");


router.get("/pending", async (req, res) => {
  const payments = await InternetPayment.find({ 
    status: { $in: ["جاري التسديد", "بدء التسديد"] } 
  });

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

//جلب جميع المستخدمين
router.get('/all-user', async(req,res)=>{
  const allUser =await User.find();
  try{
    res.status(201).json(allUser)

  }catch(err){
    res.status(401).json(err)
  }
})

router.delete('/deleteuser/:id' , async(req, res)=>{
  const id = req.params.id
  try{
  await  User.findByIdAndDelete({_id : id})
  res.status(201).json("تم حذف المستخدم")
  }catch(err){
    res.status(401).json(err)

  }
})

router.put('/addbatch/:id'  , async(req, res)=>{
  const id = req.params.id
  const batch = req.body.amount
   
  
  try{
    const newUser = await User.findById({_id:id})
    const balanceAmount = newUser.balance + batch;
    const newBalance =await new Balance({
      name : newUser.email,
      amount : batch,
      isConfirmed: true,
      destination : "nader daher",
      operator : "nader daher",
      noticeNumber: 1,
      number : "0966248984",
      user : newUser._id,

    })

    await newBalance.save();
    await User.findByIdAndUpdate(
      {_id:id},
      {balance :balanceAmount},
      {new : true}
    
    )
    
res.status(201).json("تم اضافة الدفعة بنجاح")
  }

  catch(err){
    res.status(401).json(err)

  }
})

//حذف دفعة 
router.delete('/delete/:id' , async(req,res)=>{
  const id = req.params.id
  try{
  await Balance.findByIdAndDelete({_id : id})
  res.status(201).json("delete done")
  }catch(err){
    console.log(err)
    res.status(401).json("error")
  }
})


router.get("/user/:id" , async(req,res)=>{
  const id = req.params.id
  try{
  const updateUser= await User.findById(id)
  res.status(200).json(updateUser)
  }catch(err){
    res.status(401).json(err)

  }
})
router.put("/updateuser/:id" , async(req,res)=>{
  const id = req.params.id
  try{
  const updateUser= await User.findByIdAndUpdate(
    id,
    req.body,
    {new :true}
  )
  res.status(200).json(updateUser)
  }catch(err){
    res.status(401).json(err)

  }
})




module.exports = router; // هذا السطر مهم جداً
