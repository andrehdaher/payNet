const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const savePaymentRoutes = require("./routes/savePaymentRoutes");
const saveBalanceRoutes = require("./routes/saveBalance");
const adminRoutes = require("./routes/admin");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});


// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);


app.use("/api/user", require("./routes/userRoutes"));

//عملية التسديد
app.use("/api/payment", require("./routes/paymentRoutes"));

// حفظ عملية التسديد في قاعدة البيانات
app.use("/api/savepayment", savePaymentRoutes);


app.use("/api/saveBalance", saveBalanceRoutes);


//ترحيل العمليات
app.use("/api/admin", adminRoutes);




// Connect DB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.error(err.message);
  }
};

startServer();
