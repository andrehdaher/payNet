// addUser.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("🟢 تم الاتصال بقاعدة البيانات");

  const email = "makhtar07"; // يمكنك تغييره
  const plainPassword = "Mm123123"; // كلمة المرور (غير مشفرة)
  const name ="حماد مختار"
  const number = "0933673101"

  // تحقق إذا كان المستخدم موجود مسبقاً
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("⚠️ المستخدم موجود مسبقاً");
    return process.exit(0);
  }

  // تشفير كلمة المرور
  const hashedPassword = await plainPassword;
  const Balance = 0;
  const role = "user";

  // إنشاء المستخدم
  const newUser = new User({
    email,
    password: hashedPassword,
    Balance,
    name,
    number,
    role,
  });

  await newUser.save();
  console.log("✅ تم إنشاء المستخدم بنجاح");
  process.exit(0);
})
.catch((err) => {
  console.error("❌ خطأ في الاتصال بقاعدة البيانات:", err);
  process.exit(1);
});
