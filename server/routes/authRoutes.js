/*
==============================================================
                    WLS AUTHENTICATION ROUTES
==============================================================
📝 Description: API Routes สำหรับระบบ Authentication และจัดการข้อมูล Sensor
🎯 Purpose: จัดการการสมัคร, เข้าสู่ระบบ, ยืนยันอีเมล, และ CRUD ข้อมูล
🔧 Technologies: Express Router + JWT + BCrypt + Nodemailer + MySQL

📂 Dependencies:
├── ../lib/db.js                    → Database Connection
├── ../middleware/authMiddleware.js → JWT Token Verification
└── ../lib/.env                     → Environment Variables

🌐 Base URL: /auth
Example: http://localhost:3000/auth/login

⚠️  Important Notes:
1. ทุก Protected Routes ต้องส่ง Authorization Header
2. Email Configuration ใช้ Gmail SMTP
3. File uploads จัดเก็บใน /uploads folder
4. JWT Token มีอายุ 24 ชั่วโมง
==============================================================
*/

import express from "express";
import { connectToDatabase } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import authenticateToken from "../middleware/authMiddleware.js"; // JWT Middleware
import fileUpload from "express-fileupload";

// 🔧 Load Environment Variables
dotenv.config({ path: "../lib/.env" });

// 🚀 Initialize Router & Middleware
const router = express.Router();
router.use(fileUpload()); // Enable file upload functionality

/*
==============================================================
                    🔐 AUTHENTICATION ROUTES
==============================================================
*/

// 📝 Register Route
// POST /auth/register
// Purpose: สมัครสมาชิกใหม่และส่งอีเมลยืนยัน
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const db = await connectToDatabase();
    
    // 🔍 ตรวจสอบว่า Email มีอยู่แล้วหรือไม่
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // 🔒 Hash Password และสร้าง Verification Code
    const hashPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 หลัก

    // 💾 เพิ่มผู้ใช้ใหม่พร้อมรูปโปรไฟล์ Default
    const defaultProfilePicture = "uploads/MEOW.png"; // รูป Default
    await db.query(
      "INSERT INTO users (username, email, password, verification_code, profile_picture) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashPassword, verificationCode, defaultProfilePicture]
    );

    // 📧 ส่งอีเมลยืนยัน
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "email@gmail.com",    // Gmail Account
        pass: "App Password",         // App Password (NOT regular password)
      },
    });

    await transporter.sendMail({
      from: "WLS",
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #4CAF50;">Welcome to WLS!</h2>
          <p style="text-align: center; font-size: 16px; color: #333;">
            Thank you for registering with us. Please use the verification code below to verify your email address:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #fff;">
              ${verificationCode}
            </span>
          </div>
          <p style="text-align: center; font-size: 14px; color: #666;">
            If you did not request this, please ignore this email.
          </p>
          <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
            © 2025 WLS. All rights reserved.
          </footer>
        </div>
      `,
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔄 Resend Verification Route
// POST /auth/resend-verification
// Purpose: ส่งรหัสยืนยันใหม่สำหรับผู้ใช้ที่ยังไม่ได้ verify
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    // 🔍 ตรวจสอบว่า Email มีอยู่หรือไม่
    if (rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // 🔍 ตรวจสอบว่า Email ยืนยันแล้วหรือยัง
    if (rows[0].is_verified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // 🆕 สร้างรหัสยืนยันใหม่
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query("UPDATE users SET verification_code = ? WHERE email = ?", [
      verificationCode,
      email,
    ]);

    // 📧 ส่งอีเมลยืนยันใหม่
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "email@gmail.com",
        pass: "App Password",
      },
    });

    await transporter.sendMail({
      from: "WLS",
      to: email,
      subject: "Resend Verification Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #4CAF50;">Resend Verification Email</h2>
          <p style="text-align: center; font-size: 16px; color: #333;">
            Please use the verification code below to verify your email address:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #fff;">
              ${verificationCode}
            </span>
          </div>
          <p style="text-align: center; font-size: 14px; color: #666;">
            If you did not request this, please ignore this email.
          </p>
          <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
            © 2025 WLS. All rights reserved.
          </footer>
        </div>
      `,
    });

    res.status(200).json({ message: "Verification email resent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔑 Login Route
// POST /auth/login
// Purpose: เข้าสู่ระบบและสร้าง JWT Token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    // 🔍 ตรวจสอบว่า Email มีอยู่หรือไม่
    if (rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // 🔒 ตรวจสอบรหัสผ่าน
    const isMatched = await bcrypt.compare(password, rows[0].password);
    if (!isMatched) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // 🎫 สร้าง JWT Token
    const token = jwt.sign(
      { id: rows[0].id, email: rows[0].email },
      process.env.JWT_KEY,
      { expiresIn: "24h" } // Token มีอายุ 24 ชั่วโมง
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Verify Email Route
// POST /auth/verify
// Purpose: ยืนยันอีเมลด้วยรหัสที่ส่งไป
router.post("/verify", async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND verification_code = ?",
      [email, verificationCode]
    );

    // 🔍 ตรวจสอบรหัสยืนยัน
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // ✅ อัปเดตสถานะเป็น verified
    await db.query(
      "UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?",
      [email]
    );

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🏠 Home Route (Protected)
// GET /auth/home
// Purpose: ดึงข้อมูลผู้ใช้หลังจาก Login (ใช้ JWT Token)
router.get("/home", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // ดึง Token จาก Header
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    // 🔓 ตรวจสอบ Token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user: rows[0] });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

/*
==============================================================
                    📊 SENSOR DATA ROUTES
==============================================================
*/

// 📡 Receive Sensor Data from ESP32
// POST /auth/api/sensor-data
// Purpose: รับข้อมูลจาก ESP32 และบันทึกลง Database
router.post("/api/sensor-data", async (req, res) => {
  const { userId, esp32Serial, nodeName, sensorType, value } = req.body;
  try {
    const db = await connectToDatabase();

    // 💾 บันทึกข้อมูลเซ็นเซอร์
    await db.query(
      "INSERT INTO sensor_data (user_id, esp32_serial, node_name, sensor_type, sensor_value, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, esp32Serial, nodeName, sensorType, value, new Date()]
    );

    res.status(201).json({ message: "Sensor data saved successfully" });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    res.status(500).json({ message: "Error saving sensor data" });
  }
});

// 📈 Get Sensor Data for User
// GET /auth/sensor-data
// Purpose: ดึงข้อมูลเซ็นเซอร์ทั้งหมดของผู้ใช้ (Protected Route)
router.get("/sensor-data", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // ดึง User ID จาก JWT Token
    const db = await connectToDatabase();

    // 📊 ดึงข้อมูลเซ็นเซอร์ของผู้ใช้ (เรียงจากใหม่ไปเก่า)
    const [rows] = await db.query(
      "SELECT * FROM sensor_data WHERE user_id = ? ORDER BY timestamp DESC",
      [userId]
    );

    console.log("Sensor Data:", rows); // Debug Log
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    res.status(500).json({ message: "Error fetching sensor data" });
  }
});

/*
==============================================================
                    👤 USER PROFILE ROUTES
==============================================================
*/

// 👤 Get User Profile
// GET /auth/profile
// Purpose: ดึงข้อมูลโปรไฟล์ผู้ใช้ (Protected Route)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT id, username, profile_picture FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🖼️ สร้าง Full URL สำหรับรูปโปรไฟล์
    const profilePictureUrl = `${req.protocol}://${req.get("host")}/${rows[0].profile_picture}`;
    res.status(200).json({ ...rows[0], profile_picture: profilePictureUrl });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ✏️ Update Username
// PUT /auth/profile/update-name
// Purpose: อัปเดตชื่อผู้ใช้ (Protected Route)
router.put("/profile/update-name", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const db = await connectToDatabase();
    await db.query("UPDATE users SET username = ? WHERE id = ?", [name, userId]);
    res.status(200).json({ message: "Name updated successfully" });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ message: "Error updating name" });
  }
});

// 🔐 Update Password
// PUT /auth/profile/update-password
// Purpose: อัปเดตรหัสผ่าน (ตรวจสอบรหัสเก่าก่อน)
router.put("/profile/update-password", authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 ตรวจสอบรหัสผ่านเก่า
    const isMatched = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatched) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // 🔒 Hash รหัสผ่านใหม่และอัปเดต
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashPassword, userId]);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password" });
  }
});

// 📸 Upload Profile Picture
// POST /auth/profile/upload-picture
// Purpose: อัปโหลดรูปโปรไฟล์ใหม่ (Protected Route)
router.post("/profile/upload-picture", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 🔍 ตรวจสอบว่ามีไฟล์ถูกอัปโหลดหรือไม่
    if (!req.files || !req.files.profilePicture) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.profilePicture; // ดึงไฟล์จาก request
    const fileName = `${userId}_${Date.now()}_${file.name}`; // ตั้งชื่อไฟล์ใหม่ (ป้องกันชื่อซ้ำ)
    const filePath = `uploads/${fileName}`; // Path สำหรับจัดเก็บไฟล์

    // 📁 ย้ายไฟล์ไปยังโฟลเดอร์ uploads
    await file.mv(`./${filePath}`);

    // 💾 อัปเดต Path ของรูปโปรไฟล์ในฐานข้อมูล
    const db = await connectToDatabase();
    await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [filePath, userId]);

    res.status(200).json({ message: "Profile picture updated successfully", filePath });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Error uploading profile picture" });
  }
});

/*
==============================================================
                    📧 EMAIL & UTILITY ROUTES
==============================================================
*/

// 📧 Send User ID via Email
// POST /auth/send-user-id
// Purpose: ส่ง User ID ไปทางอีเมล (สำหรับการตั้งค่า ESP32)
router.post("/send-user-id", authenticateToken, async (req, res) => {
  const { email, userId } = req.body;

  if (!email || !userId) {
    return res.status(400).json({ message: "Email and User ID are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "email@gmail.com",
        pass: "App Password",
      },
    });

    const mailOptions = {
      from: "WLS",
      to: email,
      subject: "Your User ID",
      text: `Dear User,\n\nYour User ID is: ${userId}\n\nThank you.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "User ID sent to email successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

// ℹ️ Get User Information
// GET /auth/user-info
// Purpose: ดึงข้อมูลผู้ใช้แบบละเอียด (Protected Route)
router.get("/user-info", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // ดึง User ID จาก JWT Token
    const db = await connectToDatabase();
    const [rows] = await db.query(
      "SELECT id, username, email, profile_picture FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

/*
==============================================================
                    📋 API DOCUMENTATION
==============================================================

🔐 AUTHENTICATION ENDPOINTS:
├── POST /auth/register              → สมัครสมาชิก
├── POST /auth/login                → เข้าสู่ระบบ
├── POST /auth/verify               → ยืนยันอีเมล
├── POST /auth/resend-verification  → ส่งรหัสยืนยันใหม่
└── GET  /auth/home                 → หน้าหลัก (Protected)

📊 SENSOR DATA ENDPOINTS:
├── POST /auth/api/sensor-data      → รับข้อมูลจาก ESP32
└── GET  /auth/sensor-data          → ดึงข้อมูลเซ็นเซอร์ (Protected)

👤 USER PROFILE ENDPOINTS:
├── GET  /auth/profile              → ดึงข้อมูลโปรไฟล์ (Protected)
├── PUT  /auth/profile/update-name  → อัปเดตชื่อ (Protected)
├── PUT  /auth/profile/update-password → อัปเดตรหัสผ่าน (Protected)
└── POST /auth/profile/upload-picture → อัปโหลดรูป (Protected)

📧 UTILITY ENDPOINTS:
├── POST /auth/send-user-id         → ส่ง User ID ทางอีเมล (Protected)
└── GET  /auth/user-info            → ดึงข้อมูลผู้ใช้ (Protected)

🎫 JWT TOKEN FORMAT:
Authorization: Bearer <JWT_TOKEN>

📧 EMAIL CONFIGURATION:
- Service: Gmail SMTP
- Account: email@gmail.com
- Password: App Password (NOT regular password)

🔒 SECURITY FEATURES:
- Password Hashing (BCrypt)
- JWT Token Authentication (24h expiry)
- Email Verification
- Protected Routes
- File Upload Validation

🐛 COMMON ISSUES:
1. JWT_KEY not found → Check .env file
2. Email not sending → Check Gmail App Password
3. File upload failed → Check uploads folder permissions
4. Database error → Check MySQL connection
==============================================================
*/
