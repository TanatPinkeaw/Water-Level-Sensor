/*
==============================================================
                    WLS SERVER APPLICATION
==============================================================
📝 Description: Main server file for WLS (Water Level Sensor) Monitoring System
🎯 Purpose: เป็นหัวใจหลักของ Backend Server ที่จัดการทุกอย่าง
🔧 Technologies: Node.js + Express.js + MySQL + JWT Authentication

📂 File Structure Dependencies:
├── routes/authRoutes.js     → API Routes สำหรับ Authentication & Sensor Data
├── middleware/authMiddleware.js → JWT Token Verification
└── lib/db.js               → Database Connection & Cleanup Functions

🌐 URLs:
- Development: http://localhost:3000
- Production: http://wls-sensor-data.duckdns.org:3000
- Frontend: http://localhost:5173 (Development)
- Frontend: http://wls-sensor-data.duckdns.org (Production)

⚠️  Important Notes:
1. Server ต้องรันก่อน Frontend เสมอ
2. Database ต้องเปิดใช้งาน (XAMPP/WAMP)
3. Environment variables อยู่ใน ./lib/.env
4. Static files (รูปโปรไฟล์) อยู่ใน /uploads
==============================================================
*/

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import authenticateToken from "./middleware/authMiddleware.js";
import dotenv from "dotenv";
import cron from "node-cron";
import { deleteUnverifiedUsers, deleteOldSensorData } from "./lib/db.js";

// 🔧 Load Environment Variables from ./lib/.env
dotenv.config({ path: './lib/.env' });

// 🚀 Initialize Express Application
const app = express();

// 🌐 CORS Configuration
// อนุญาตให้ Frontend เชื่อมต่อได้จาก 2 URL
app.use(cors({
  origin: [
    "http://localhost:5173",                    // 🏠 Development URL (Vite Dev Server)
    "http://wls-sensor-data.duckdns.org"       // 🌍 Production URL (Live Website)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],    // HTTP Methods ที่อนุญาต
}));

// 📥 JSON Parser Middleware
// แปลง Request Body จาก JSON เป็น JavaScript Object
app.use(express.json());

// 🛣️ API Routes
// ทุก API Routes จะเริ่มต้นด้วย /auth (เช่น /auth/login, /auth/register)
app.use("/auth", authRoutes);

// 📁 Static File Serving
// เสิร์ฟไฟล์รูปภาพจากโฟลเดอร์ uploads (Profile Pictures)
// Example: http://localhost:3000/uploads/profile.jpg
app.use("/uploads", express.static("uploads"));

// ⏰ CRON JOBS - Automated Tasks
// =================================

// 🗑️ Cleanup Unverified Users (ทุก 1 นาที)
// ลบผู้ใช้ที่ไม่ได้ verify email ภายใน 1 นาทีหลังจากสมัคร
cron.schedule('*/1 * * * *', async () => {
  console.log('🔍 Checking for unverified users...');
  await deleteUnverifiedUsers();
});

// 🗑️ Cleanup Old Sensor Data (ทุกวันเวลา 00:00)
// ลบข้อมูลเซ็นเซอร์ที่เก่ากว่า 1 วัน เพื่อประหยัด Storage
cron.schedule("0 0 * * *", async () => {
  console.log('🧹 Running daily cleanup task...');
  await deleteOldSensorData();
});

// 🎯 Start Server
// เริ่มต้น Server บน Port ที่กำหนดใน Environment Variable
app.listen(process.env.PORT, () => {
  console.log(`🚀 WLS Server is running on port ${process.env.PORT}`);
  console.log(`📍 Local URL: http://localhost:${process.env.PORT}`);
  console.log(`🌍 Production URL: http://wls-sensor-data.duckdns.org:${process.env.PORT}`);
  console.log(`⏰ Auto cleanup tasks are scheduled and running...`);
});

/*
==============================================================
                    🔧 DEVELOPMENT COMMANDS
==============================================================
📦 Install Dependencies:
npm install

🚀 Start Development Server:
npm run dev
หรือ
node app.js

📊 Monitor Server:
- ดู Console Logs สำหรับ Cron Jobs
- ตรวจสอบ Database Connection
- เช็ค API Response ใน Browser/Postman

🐛 Common Issues:
1. Port 3000 already in use → เปลี่ยน PORT ในไฟล์ .env
2. CORS Error → ตรวจสอบ Frontend URL ใน cors configuration
3. Database Error → เช็ค XAMPP/WAMP และ Environment Variables
4. JWT Error → ตรวจสอบ JWT_KEY ในไฟล์ .env

📧 API Endpoints:
- POST /auth/register        → สมัครสมาชิก
- POST /auth/login          → เข้าสู่ระบบ  
- POST /auth/verify         → ยืนยัน Email
- GET  /auth/home           → หน้าหลัก (Protected)
- GET  /auth/profile        → ข้อมูลโปรไฟล์
- POST /auth/api/sensor-data → รับข้อมูลจาก ESP32
- GET  /auth/sensor-data    → ดึงข้อมูลเซ็นเซอร์

🔐 Authentication Flow:
1. Register → Send Email → Verify → Login → Get JWT Token
2. ทุก Protected Route ต้องส่ง Authorization Header
3. Format: "Bearer <JWT_TOKEN>"
==============================================================
*/