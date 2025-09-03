/*
==============================================================
                    WLS DATABASE CONNECTION & UTILITIES
==============================================================
📝 Description: Database connection และ utility functions สำหรับ WLS System
🎯 Purpose: จัดการการเชื่อมต่อฐานข้อมูลและงานทำความสะอาดข้อมูลอัตโนมัติ
🔧 Technologies: MySQL2 + Node.js + Environment Variables

📂 Database Configuration:
├── Host: localhost (XAMPP/WAMP)
├── User: root 
├── Password: (empty - default XAMPP)
├── Database: mydb
└── Port: 3306 (default MySQL port)

📊 Tables Used:
├── users → ข้อมูลผู้ใช้งาน
│   ├── id (Primary Key)
│   ├── username, email, password
│   ├── is_verified (0/1)
│   ├── verification_code
│   ├── profile_picture
│   └── created_at (timestamp)
└── sensor_data → ข้อมูลเซ็นเซอร์จาก ESP32
    ├── id (Primary Key)
    ├── user_id (Foreign Key)
    ├── esp32_serial, node_name
    ├── sensor_type, sensor_value
    └── timestamp

⚠️  Important Notes:
1. ต้องเปิด XAMPP/WAMP ก่อนรันโปรแกรม
2. สร้างฐานข้อมูล 'mydb' ใน phpMyAdmin
3. Environment Variables อยู่ในไฟล์ .env
4. Auto Cleanup จะรันตาม Cron Schedule ใน app.js
==============================================================
*/

import mysql from "mysql2/promise"; // MySQL2 with Promise support
import dotenv from "dotenv";

// 🔧 Load Environment Variables from .env file
dotenv.config();

/*
==============================================================
                    🔌 DATABASE CONNECTION FUNCTION
==============================================================
📝 Purpose: สร้างการเชื่อมต่อไปยังฐานข้อมูล MySQL
📥 Input: ไม่มี (ใช้ Environment Variables)
📤 Output: MySQL Connection Object
🔄 Usage: ใช้ใน async function เท่านั้น

💡 How it works:
1. อ่านค่า Config จาก Environment Variables (.env)
2. สร้าง Connection ด้วย mysql.createConnection()
3. Return Connection Object สำหรับ Query

⚠️  Error Handling:
- หากเชื่อมต่อไม่ได้จะ throw Error
- ต้องใช้ try-catch ในการเรียกใช้
==============================================================
*/

export async function connectToDatabase() {
  try {
    // 🏗️ สร้างการเชื่อมต่อฐานข้อมูล
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,         // localhost (XAMPP)
      user: process.env.DB_USER,         // root
      password: process.env.DB_PASSWORD, // (empty)
      database: process.env.DB_NAME,     // mydb
    });

    // ✅ Connection สำเร็จ
    console.log(`📡 Connected to MySQL database: ${process.env.DB_NAME}`);
    return connection;
  } catch (error) {
    // ❌ Connection ล้มเหลว
    console.error("🚫 Database connection failed:", error.message);
    throw error; // ส่ง Error ต่อไปให้ caller handle
  }
}

/*
==============================================================
                    🗑️ CLEANUP UNVERIFIED USERS
==============================================================
📝 Purpose: ลบผู้ใช้ที่ไม่ได้ verify email ภายใน 1 นาที
📥 Input: ไม่มี
📤 Output: Console log ผลลัพธ์
🔄 Schedule: ทุก 1 นาที (Cron Job ใน app.js)

💡 How it works:
1. คำนวณเวลา 1 นาทีที่แล้ว
2. ลบ users ที่ is_verified = 0 และ created_at < 1 นาทีที่แล้ว
3. แสดงจำนวนที่ลบใน Console

🎯 Why we need this:
- ป้องกัน Database เต็มด้วยข้อมูลขยะ
- บังคับให้ผู้ใช้ verify email ภายในเวลาที่กำหนด
- เพิ่มความปลอดภัยของระบบ
==============================================================
*/

export async function deleteUnverifiedUsers() {
  let db;
  try {
    // 🔌 เชื่อมต่อฐานข้อมูล
    db = await connectToDatabase();
    
    // ⏰ คำนวณเวลา 1 นาทีที่แล้ว
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    console.log(`🔍 Checking unverified users older than: ${oneMinuteAgo.toISOString()}`);

    // 🗑️ ลบผู้ใช้ที่ไม่ได้ verify
    const [result] = await db.query(
      "DELETE FROM users WHERE is_verified = 0 AND created_at < ?",
      [oneMinuteAgo]
    );
    
    // 📊 แสดงผลลัพธ์
    if (result.affectedRows > 0) {
      console.log(`🗑️ Deleted ${result.affectedRows} unverified user(s).`);
    } else {
      console.log("✅ No unverified users to delete.");
    }
  } catch (error) {
    console.error("❌ Error deleting unverified users:", error.message);
  } finally {
    // 🔌 ปิดการเชื่อมต่อฐานข้อมูล
    if (db) {
      await db.end();
      console.log("📡 Database connection closed (cleanup unverified users).");
    }
  }
}

/*
==============================================================
                    🧹 CLEANUP OLD SENSOR DATA
==============================================================
📝 Purpose: ลบข้อมูลเซ็นเซอร์ที่เก่ากว่า 1 วัน
📥 Input: ไม่มี
📤 Output: Console log ผลลัพธ์
🔄 Schedule: ทุกวันเวลา 00:00 (Cron Job ใน app.js)

💡 How it works:
1. ลบข้อมูลใน sensor_data ที่ timestamp < NOW() - INTERVAL 1 DAY
2. ใช้ MySQL function NOW() และ INTERVAL
3. แสดงผลลัพธ์ใน Console

🎯 Why we need this:
- ประหยัด Storage Space
- เพิ่มประสิทธิภาพ Database
- ข้อมูลเซ็นเซอร์เก่าไม่จำเป็นต้องเก็บนาน
- ป้องกัน Database โต
==============================================================
*/

export const deleteOldSensorData = async () => {
  let db;
  try {
    // 🔌 เชื่อมต่อฐานข้อมูล
    db = await connectToDatabase();
    
    // 🧹 เริ่มกระบวนการลบข้อมูลเก่า
    console.log("🧹 Starting cleanup: Deleting old sensor data...");
    
    // 🗑️ ลบข้อมูลเซ็นเซอร์ที่เก่ากว่า 1 วัน
    const [result] = await db.query(
      "DELETE FROM sensor_data WHERE timestamp < NOW() - INTERVAL 1 DAY"
    );
    
    // 📊 แสดงผลลัพธ์
    if (result.affectedRows > 0) {
      console.log(`🗑️ Deleted ${result.affectedRows} old sensor record(s).`);
    } else {
      console.log("✅ No old sensor data to delete.");
    }
    
    console.log("✅ Sensor data cleanup completed successfully.");
  } catch (error) {
    console.error("❌ Error deleting old sensor data:", error.message);
  } finally {
    // 🔌 ปิดการเชื่อมต่อฐานข้อมูล
    if (db) {
      await db.end();
      console.log("📡 Database connection closed (cleanup sensor data).");
    }
  }
};

/*
==============================================================
                    📋 DATABASE SETUP GUIDE
==============================================================

🚀 Initial Setup:
1. เปิด XAMPP/WAMP
2. เข้า phpMyAdmin (http://localhost/phpmyadmin)
3. สร้างฐานข้อมูลใหม่ชื่อ "mydb"
4. รัน SQL commands ด้านล่าง

📊 CREATE TABLES SQL:
-- สร้างตาราง users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  verification_code VARCHAR(6),
  is_verified BOOLEAN DEFAULT FALSE,
  profile_picture VARCHAR(255) DEFAULT 'uploads/MEOW.png',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง sensor_data
CREATE TABLE sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  esp32_serial VARCHAR(255),
  node_name VARCHAR(255),
  sensor_type VARCHAR(100),
  sensor_value DECIMAL(10,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

🔧 Environment Variables (.env):
DB_HOST="localhost"      → MySQL Host (ปกติใช้ localhost)
DB_USER="root"          → MySQL Username (XAMPP default)
DB_PASSWORD=""          → MySQL Password (XAMPP ปกติไม่มี password)
DB_NAME="mydb"          → Database Name
PORT=3000               → Server Port
JWT_KEY="FullstackLogin_2025"  → JWT Secret Key

🐛 Common Issues:
1. "Connection refused" → เช็คว่าเปิด XAMPP/WAMP แล้วหรือยัง
2. "Database not found" → สร้างฐานข้อมูล mydb ใน phpMyAdmin
3. "Access denied" → เช็ค username/password ในไฟล์ .env
4. "Table not found" → รัน SQL commands สร้างตาราง

📱 Testing Database:
// Test Connection
import { connectToDatabase } from './lib/db.js';
const db = await connectToDatabase();
console.log("Database connected successfully!");

🔍 Monitoring:
- ดู Console Logs สำหรับ Auto Cleanup
- เช็ค phpMyAdmin สำหรับข้อมูลในตาราง
- ตรวจสอบ XAMPP Control Panel ว่า MySQL เปิดอยู่

⚠️  Production Notes:
1. เปลี่ยน DB_PASSWORD ให้ปลอดภัย
2. ใช้ Connection Pool สำหรับ High Traffic
3. ตั้งค่า SSL สำหรับ Database Connection
4. Backup ฐานข้อมูลสม่ำเสมอ
==============================================================
*/