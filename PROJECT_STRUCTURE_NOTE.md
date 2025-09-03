# 📝 Project Structure Note - WLS (Water Level Sensor) Monitoring System

## 🏗️ โครงสร้างโปรเจกต์โดยรวม

โปรเจกต์นี้เป็นระบบ **Fullstack Web Application** สำหรับการ Login และ Monitoring ข้อมูลเซ็นเซอร์วัดระดับน้ำ (Water Level Sensor) ประกอบด้วย 3 ส่วนหลัก:

---

## 📁 1. **frontend/** - ส่วน Frontend (React + Vite)

### 🎯 **หน้าที่**: เป็นส่วน User Interface ที่ผู้ใช้โต้ตอบได้

### 📋 **เทคโนโลยีที่ใช้**:
- **React 18.3.1** - JavaScript Framework หลัก
- **Vite** - Build Tool และ Development Server
- **TailwindCSS** - CSS Framework สำหรับจัดแต่ง UI
- **React Router DOM** - จัดการ Navigation ระหว่างหน้า
- **Axios** - ติดต่อกับ Backend API
- **Chart.js & Recharts** - แสดงกราฟข้อมูลเซ็นเซอร์
- **React Gauge Chart** - แสดงมิเตอร์วัดค่า
- **Framer Motion** - Animation Effects
- **React Icons** - ไอคอนต่างๆ

### 📂 **โครงสร้างไฟล์**:
```
fontend/                     # ⚠️ Note: ชื่อ folder ผิด ควรเป็น "frontend"
├── index.html               # HTML หลัก
├── package.json             # Dependencies และ Scripts
├── vite.config.js           # การตั้งค่า Vite
├── eslint.config.js         # การตั้งค่า ESLint
├── .gitignore               # ไฟล์ที่ไม่ต้อง commit
├── README.md                # คู่มือการใช้งาน
├── public/                  # Static Files
│   ├── BGG.jpg              # Background Image (JPG)
│   ├── BGG.png              # Background Image (PNG)
│   └── vite.svg             # Vite Logo
└── src/                     # Source Code หลัก
    ├── App.jsx              # ไฟล์หลัก กำหนด Routes
    ├── main.jsx             # Entry point ของแอป
    ├── index.css            # CSS หลัก
    ├── config.js            # การตั้งค่า API URL
    ├── assets/              # Assets ต่างๆ
    │   └── react.svg        # React Logo
    ├── components/          # Component ที่ใช้ซ้ำได้
    │   ├── Navbar.jsx       # แถบเมนูด้านบน
    │   └── Sidebar.jsx      # เมนูด้านข้าง
    └── pages/               # หน้าต่างๆ ของเว็บ
        ├── Dashboard.jsx    # หน้าแสดงข้อมูลเซ็นเซอร์
        ├── Login.jsx        # หน้าเข้าสู่ระบบ
        ├── Register.jsx     # หน้าสมัครสมาชิก
        ├── Verify.jsx       # หน้ายืนยัน Email
        ├── Profile.jsx      # หน้าโปรไฟล์ผู้ใช้
        └── Move.jsx         # หน้า Landing/Home
```

### 🌟 **คุณสมบัติหลัก**:
- ระบบ Authentication (Login/Register/Verify)
- Dashboard แสดงข้อมูลเซ็นเซอร์แบบ Real-time
- การจัดการโปรไฟล์ผู้ใช้
- Responsive Design (ใช้งานได้ทั้ง Desktop/Mobile)

---

## 🖥️ 2. **server/** - ส่วน Backend (Node.js + Express)

### 🎯 **หน้าที่**: จัดการ API, Database, Authentication และรับข้อมูลจากเซ็นเซอร์

### 📋 **เทคโนโลยีที่ใช้**:
- **Node.js + Express** - Web Server Framework
- **MySQL2** - Database สำหรับเก็บข้อมูล
- **JWT (jsonwebtoken)** - การจัดการ Authentication
- **bcrypt** - เข้ารหัสรหัสผ่าน
- **Nodemailer** - ส่งอีเมลยืนยัน
- **CORS** - อนุญาตการเชื่อมต่อจาก Frontend
- **Express-fileupload** - อัปโหลดไฟล์
- **Node-cron** - จัดการงานตามเวลา (Cleanup tasks)

### 📂 **โครงสร้างไฟล์**:
```
server/
├── app.js                    # ไฟล์หลักของ Server (Entry Point)
├── package.json              # Dependencies และ Scripts
├── lib/                      # Library และ Utilities
│   ├── db.js                 # การเชื่อมต่อ Database และ Functions
│   └── .env                  # Environment Variables (การตั้งค่าลับ)
├── middleware/               # Middleware Functions
│   └── authMiddleware.js     # ตรวจสอบ JWT Token
├── routes/                   # API Routes
│   └── authRoutes.js         # API Routes สำหรับ Authentication
└── uploads/                  # โฟลเดอร์เก็บไฟล์ที่อัปโหลด
    ├── MEOW.png              # รูปโปรไฟล์ Default
    └── [user_id]_[timestamp]_[filename]  # รูปโปรไฟล์ผู้ใช้
```

### 🌟 **คุณสมบัติหลัก**:
- **Authentication System**: Register, Login, Email Verification
- **Sensor Data API**: รับและเก็บข้อมูลจาก ESP32
- **File Upload**: อัปโหลดรูปโปรไฟล์
- **Auto Cleanup**: ลบข้อมูลเก่าและผู้ใช้ที่ไม่ได้ verify อัตโนมัติ
- **CORS Support**: รองรับการเชื่อมต่อจาก Domain ต่างๆ

### 🔗 **API Endpoints**:

#### **Authentication APIs:**
- `POST /auth/register` - สมัครสมาชิก (ส่งอีเมลยืนยัน)
- `POST /auth/login` - เข้าสู่ระบบ (รับ JWT Token)
- `POST /auth/verify` - ยืนยันอีเมลด้วยรหัส 6 หลัก
- `POST /auth/resend-verification` - ส่งรหัสยืนยันใหม่
- `GET /auth/home` - ดึงข้อมูลผู้ใช้ (Protected Route)

#### **Profile Management APIs:**
- `GET /auth/profile` - ดึงข้อมูลโปรไฟล์ผู้ใช้
- `PUT /auth/profile/update-name` - อัปเดตชื่อผู้ใช้
- `PUT /auth/profile/update-password` - เปลี่ยนรหัสผ่าน
- `POST /auth/profile/upload-picture` - อัปโหลดรูปโปรไฟล์

#### **Sensor Data APIs:**
- `POST /auth/api/sensor-data` - รับข้อมูลเซ็นเซอร์จาก ESP32
- `GET /auth/sensor-data` - ดึงข้อมูลเซ็นเซอร์ของผู้ใช้ (Protected)

#### **Utility APIs:**
- `POST /auth/send-user-id` - ส่ง User ID ทางอีเมล
- `GET /auth/user-info` - ดึงข้อมูลผู้ใช้เพิ่มเติม

#### **Static Files:**
- `/uploads/*` - เสิร์ฟไฟล์รูปภาพที่อัปโหลด

---

## 🔌 3. **ReadanalogdataNEW/** - ส่วน Hardware (ESP32 Arduino)

### 🎯 **หน้าที่**: อ่านข้อมูลเซ็นเซอร์และส่งไปยัง Backend

### 📋 **เทคโนโลยีที่ใช้**:
- **ESP32** - Microcontroller หลัก
- **Arduino IDE/Framework** - การเขียนโปรแกรม
- **RS485 Communication** - การสื่อสารกับเซ็นเซอร์
- **WiFi** - เชื่อมต่ออินเตอร์เน็ต
- **HTTP Client** - ส่งข้อมูลไปยัง Backend
- **ArduinoJson** - จัดการข้อมูล JSON

### 📂 **ไฟล์หลัก**:
```
ReadanalogdataNEW.ino     # โค้ดหลักสำหรับ ESP32
```

### ⚙️ **การตั้งค่าที่สำคัญ**:
```cpp
// การเชื่อมต่อ WiFi
const char* ssid = "QW_F1_2.4G";
const char* password = "Qwave@dmin";

// Backend URL
const String backendURL = "http://192.168.2.25:3000/auth/api/sensor-data";

// ข้อมูลเฉพาะตัว
const String USER_ID = "38";              // ID ผู้ใช้
const String ESP32_SERIAL_NUMBER = "1";   // Serial Number ESP32
const String SENSOR_TYPE = "WaterLevel";  // ประเภทเซ็นเซอร์
```

### 🌟 **คุณสมบัติหลัก**:
- **อ่านข้อมูลเซ็นเซอร์**: ผ่าน RS485 Communication
- **เชื่อมต่อ WiFi**: เชื่อมต่ออินเตอร์เน็ตอัตโนมัติ
- **ส่งข้อมูล Real-time**: ส่งข้อมูลไปยัง Backend ทุก ๆ ช่วงเวลา
- **จัดการข้อผิดพลาด**: ระบบ Retry และ Error Handling

---

## 🔄 4. **Data Flow (การไหลของข้อมูล)**

### **📊 Sensor Data Flow:**
```
ESP32 (เซ็นเซอร์วัดระดับน้ำ)
    ↓ [WiFi + HTTP POST]
Backend API (/auth/api/sensor-data)
    ↓ [บันทึกใน MySQL Database]
Frontend Dashboard (ใช้ JWT Token)
    ↓ [แสดงผลเป็นกราฟ/มิเตอร์ Real-time]
ผู้ใช้งาน (Dashboard, Charts, Gauges)
```

### **🔐 Authentication Flow:**
```
ผู้ใช้กรอก Register Form
    ↓ [POST /auth/register]
Backend ส่งอีเมลยืนยัน (6 digits code)
    ↓ [ผู้ใช้กรอกรหัสยืนยัน]
Backend ตรวจสอบและ Verify Email
    ↓ [POST /auth/login]
Backend ส่ง JWT Token กลับ
    ↓ [เก็บ Token ใน localStorage]
Frontend ใช้ Token เรียก Protected APIs
```

### **📁 File Upload Flow:**
```
ผู้ใช้เลือกรูปโปรไฟล์
    ↓ [POST /auth/profile/upload-picture]
Backend เก็บไฟล์ใน /uploads/
    ↓ [แรมโครงสร้างชื่อไฟล์: userId_timestamp_filename]
Database อัปเดต profile_picture path
    ↓ [เสิร์ฟผ่าน /uploads/* static route]
Frontend แสดงรูปโปรไฟล์ใหม่
```

---

## 🚀 5. **วิธีการรันโปรเจกต์**

### **🗄️ 1. เตรียม Database (MySQL):**
```sql
-- สร้าง Database
CREATE DATABASE mydb;
USE mydb;

-- สร้างตาราง users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  verification_code VARCHAR(6),
  is_verified BOOLEAN DEFAULT 0,
  profile_picture VARCHAR(255) DEFAULT 'uploads/MEOW.png',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง sensor_data
CREATE TABLE sensor_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  esp32_serial VARCHAR(50),
  node_name VARCHAR(100),
  sensor_type VARCHAR(50),
  sensor_value DECIMAL(10,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **🖥️ 2. Backend Setup:**
```bash
cd server
npm install
# ตั้งค่า .env ใน /server/lib/.env
# เริ่มการทำงาน
npm start
```
**รันที่**: `http://localhost:3000`

### **🌐 3. Frontend Setup:**
```bash
cd fontend  # Note: ชื่อ folder ผิด ควรเป็น "frontend"
npm install
npm run dev
```
**เปิดที่**: `http://localhost:5173`

### **🔌 4. ESP32 Setup:**
1. เปิดไฟล์ `.ino` ใน Arduino IDE
2. ติดตั้ง Library: `ArduinoJson`
3. ตั้งค่า WiFi SSID/Password
4. ตั้งค่า Backend URL (`http://192.168.2.25:3000/auth/api/sensor-data`)
5. ตั้งค่า USER_ID และ ESP32_SERIAL_NUMBER
6. Upload ไปยัง ESP32

### **🌍 5. Production URLs:**
- **Frontend**: http://wls-sensor-data.duckdns.org
- **Backend**: http://192.168.2.25:3000

---

## 🗃️ 6. **Database Structure & Environment**

### **🔧 Environment Variables (.env)**:
```env
DB_HOST="localhost"           # Database Host
DB_USER="root"               # Database Username  
DB_PASSWORD=""               # Database Password (ว่าง = no password)
DB_NAME="mydb"               # ชื่อ Database
PORT=3000                    # Port ของ Server
JWT_KEY="FullstackLogin_2025" # Secret Key สำหรับ JWT
```

### **📊 ตารางฐานข้อมูล (MySQL)**:

#### **1. ตาราง `users`:**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR) - ชื่อผู้ใช้
- email (VARCHAR, UNIQUE) - อีเมล
- password (VARCHAR) - รหัสผ่านที่เข้ารหัสแล้ว (bcrypt)
- verification_code (VARCHAR) - รหัสยืนยัน 6 หลัก
- is_verified (BOOLEAN) - สถานะการยืนยันอีเมล
- profile_picture (VARCHAR) - Path รูปโปรไฟล์
- created_at (TIMESTAMP) - วันที่สร้างบัญชี
```

#### **2. ตาราง `sensor_data`:**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY) - ID ผู้ใช้
- esp32_serial (VARCHAR) - Serial Number ของ ESP32
- node_name (VARCHAR) - ชื่อ Node/ตำแหน่ง
- sensor_type (VARCHAR) - ประเภทเซ็นเซอร์ (เช่น "WaterLevel")
- sensor_value (DECIMAL) - ค่าที่วัดได้
- timestamp (TIMESTAMP) - เวลาที่บันทึกข้อมูล
```

### **🧹 Auto Cleanup System:**
- **ลบผู้ใช้ที่ไม่ verify**: ทุก 1 นาที (users ที่ is_verified = 0 เกิน 1 นาที)
- **ลบข้อมูลเซ็นเซอร์เก่า**: ทุกวันเที่ยงคืน (sensor_data เก่ากว่า 1 วัน)

### **📧 Email Configuration:**
- **Service**: Gmail SMTP
- **From**: 123123somelong@gmail.com
- **App Password**: hdyx lnot jfvx dwpi
- **Features**: ส่งรหัสยืนยัน 6 หลัก, HTML Email Template

---

## 📝 7. **หมายเหตุและคุณสมบัติพิเศษ**

### **🔐 Security Features:**
- **JWT Authentication**: Token หมดอายุใน 24 ชั่วโมง
- **Password Hashing**: ใช้ bcrypt กับ salt rounds = 10
- **Email Verification**: ต้องยืนยันอีเมลก่อนใช้งาน (รหัส 6 หลัก)
- **Protected Routes**: ใช้ authMiddleware ตรวจสอบ Token
- **CORS Policy**: จำกัดการเข้าถึงจาก Domain ที่อนุญาตเท่านั้น

### **📧 Email System:**
- **Gmail SMTP**: ส่งอีเมลผ่าน Gmail
- **HTML Templates**: อีเมลแบบสวยงามพร้อม CSS
- **Verification Code**: รหัส 6 หลักแบบสุ่ม (100000-999999)
- **Resend Feature**: ส่งรหัสยืนยันใหม่ได้

### **📁 File Management:**
- **Default Profile**: รูปโปรไฟล์เริ่มต้น (MEOW.png)
- **Upload System**: รองรับการอัปโหลดรูปโปรไฟล์
- **File Naming**: รูปแบบ `userId_timestamp_filename`
- **Static Serving**: เสิร์ฟไฟล์ผ่าน `/uploads/*`

### **🧹 Auto Cleanup:**
- **Unverified Users**: ลบอัตโนมัติทุก 1 นาที (เก่ากว่า 1 นาที)
- **Old Sensor Data**: ลบอัตโนมัติทุกวัน เที่ยงคืน (เก่ากว่า 1 วัน)
- **Cron Jobs**: ใช้ node-cron สำหรับงานตามเวลา

### **📊 Data Visualization:**
- **Chart.js**: กราฟเส้น, กราฟแท่ง
- **Recharts**: กราฟขั้นสูง
- **React Gauge Chart**: มิเตอร์แสดงค่า
- **React D3 Speedometer**: มิเตอร์วัดความเร็ว
- **Real-time Updates**: ข้อมูลอัปเดตแบบเรียลไทม์

### **🌐 Responsive Design:**
- **TailwindCSS**: Framework CSS สำหรับ Responsive
- **Mobile First**: ออกแบบให้ใช้งานมือถือก่อน
- **Cross Browser**: ใช้งานได้ทุก Browser

### **⚠️ Important Notes:**
- **Folder Name**: `fontend` ควรเปลี่ยนเป็น `frontend` (การสะกดผิด)
- **Database**: ต้องสร้าง Database `mydb` ใน MySQL ก่อน
- **Environment**: ไฟล์ `.env` อยู่ใน `/server/lib/.env`
- **Port Configuration**: Frontend: 5173, Backend: 3000
- **CORS**: อนุญาต localhost:5173 และ wls-sensor-data.duckdns.org

---

## 🔧 8. **การพัฒนาต่อ (Future Development)**

### **📈 Features ที่ควรเพิ่ม:**
- **เซ็นเซอร์หลากหลาย**: Temperature, Humidity, Pressure sensors
- **ระบบแจ้งเตือน**: Alert เมื่อค่าเซ็นเซอร์ผิดปกติ
- **การ Export ข้อมูล**: ดาวน์โหลดเป็น CSV, Excel, PDF
- **Dashboard Analytics**: สถิติและการวิเคราะห์ข้อมูล
- **User Management**: ระบบ Admin จัดการผู้ใช้
- **Mobile App**: React Native หรือ Flutter
- **Offline Mode**: ทำงานได้แม้ไม่มีอินเตอร์เน็ต
- **Multi-Language**: รองรับหลายภาษา

### **🛠️ Technical Improvements:**
- **TypeScript**: เพิ่ม Type Safety
- **Unit Testing**: Jest, React Testing Library
- **API Documentation**: Swagger/OpenAPI
- **Error Logging**: Winston, Morgan
- **Performance**: Redis Cache, CDN
- **Security**: Rate Limiting, Input Validation
- **Deployment**: Docker, CI/CD Pipeline

### **🏗️ Architecture Upgrades:**
- **Microservices**: แบ่งเป็น Services เล็กๆ
- **Message Queue**: RabbitMQ, Redis Pub/Sub
- **Load Balancer**: Nginx, HAProxy
- **Database**: MongoDB, PostgreSQL
- **Cloud Deployment**: AWS, Google Cloud, Azure

---

📅 **สร้างเมื่อ**: September 3, 2025  
👨‍💻 **โดย**: GitHub Copilot
