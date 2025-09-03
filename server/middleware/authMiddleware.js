/*
==============================================================
                    JWT AUTHENTICATION MIDDLEWARE
==============================================================
📝 Description: Middleware สำหรับตรวจสอบ JWT Token ในทุก Protected Routes
🎯 Purpose: ป้องกันการเข้าถึง API ที่ต้องมีการ Login ก่อน
🔧 Technologies: JSON Web Token (JWT) + Node.js

📂 How it works:
1. ดึง Authorization Header จาก Request
2. แยก Token ออกจาก "Bearer <TOKEN>" format
3. ตรวจสอบ Token ด้วย JWT_KEY
4. ถ้าถูกต้อง → เก็บข้อมูลผู้ใช้ใน req.user และส่งต่อ
5. ถ้าผิด → ส่ง Error Response กลับ

🔐 Security Features:
- Token Expiration (24 hours)
- Secret Key Validation
- Error Handling for Invalid/Expired Tokens
- Prevent Unauthorized Access

⚠️  Important Notes:
1. Middleware นี้ต้องใช้กับทุก Protected Routes
2. JWT_KEY ต้องตรงกับตอนสร้าง Token ในการ Login
3. Frontend ต้องส่ง Header: "Authorization: Bearer <TOKEN>"
4. req.user จะมีข้อมูล { id, email, iat, exp }
==============================================================
*/

/*
==============================================================
                    🔒 AUTHENTICATE TOKEN FUNCTION
==============================================================
📝 Purpose: ตรวจสอบ JWT Token และอนุญาตให้เข้าถึง Protected Routes
📥 Input: req, res, next (Express middleware parameters)
📤 Output: req.user (ข้อมูลผู้ใช้จาก Token) หรือ Error Response

🔄 Flow:
1. ดึง Authorization Header → "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
2. แยก Token → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
3. Verify Token → ตรวจสอบกับ JWT_KEY
4. Success → เก็บข้อมูลใน req.user และเรียก next()
5. Error → ส่ง 401/403 Response

🎫 Token Format Expected:
Authorization: Bearer <JWT_TOKEN>

📊 req.user Structure (หลังจาก decode):
{
  id: 123,           // User ID from database
  email: "user@email.com",
  iat: 1234567890,   // Token issued at
  exp: 1234567890    // Token expiration
}
==============================================================
*/

import jwt from "jsonwebtoken";

/*
==============================================================
                    🔒 AUTHENTICATE TOKEN FUNCTION
==============================================================
📝 Purpose: ตรวจสอบ JWT Token และอนุญาตให้เข้าถึง Protected Routes
📥 Input: req, res, next (Express middleware parameters)
📤 Output: req.user (ข้อมูลผู้ใช้จาก Token) หรือ Error Response

🔄 Flow:
1. ดึง Authorization Header → "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
2. แยก Token → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
3. Verify Token → ตรวจสอบกับ JWT_KEY
4. Success → เก็บข้อมูลใน req.user และเรียก next()
5. Error → ส่ง 401/403 Response

🎫 Token Format Expected:
Authorization: Bearer <JWT_TOKEN>

📊 req.user Structure (หลังจาก decode):
{
  id: 123,           // User ID from database
  email: "user@email.com",
  iat: 1234567890,   // Token issued at
  exp: 1234567890    // Token expiration
}
==============================================================
*/

const authenticateToken = (req, res, next) => {
  // 📥 ดึง Authorization Header จาก Request
  // Expected format: "Bearer <JWT_TOKEN>"
  const authHeader = req.headers.authorization;
  
  // 🔧 แยก Token ออกจาก Header
  // split(" ")[1] → เอาเฉพาะส่วน Token (ตัดคำว่า "Bearer" ออก)
  const token = authHeader && authHeader.split(" ")[1];

  // 🚫 ตรวจสอบว่ามี Token หรือไม่
  if (!token) {
    return res.status(401).json({ 
      message: "Unauthorized: No token provided",
      hint: "Please include 'Authorization: Bearer <token>' in headers"
    });
  }

  try {
    // 🔓 ตรวจสอบ Token ด้วย JWT_KEY
    // jwt.verify() จะ decode Token และตรวจสอบ signature
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    
    // ✅ เก็บข้อมูลผู้ใช้จาก Token ไว้ใน req.user
    // ข้อมูลนี้จะใช้ได้ในทุก Route ที่ผ่าน Middleware นี้
    req.user = decoded; // { id, email, iat, exp }
    
    // 🚀 ส่งต่อไปยัง Route Handler ถัดไป
    next();
  } catch (error) {
    // ❌ Token ไม่ถูกต้อง หรือหมดอายุ
    console.error("JWT Verification Error:", error.message); // Debug Log
    
    return res.status(403).json({ 
      message: "Forbidden: Invalid token",
      error: error.message,
      hint: "Token may be expired or invalid. Please login again."
    });
  }
};

export default authenticateToken;

/*
==============================================================
                    📋 USAGE EXAMPLES
==============================================================

🔧 How to use in Routes:
import authenticateToken from "./middleware/authMiddleware.js";

// ✅ Protected Route Example
router.get("/profile", authenticateToken, (req, res) => {
  // req.user จะมีข้อมูลผู้ใช้จาก Token
  console.log("User ID:", req.user.id);
  console.log("User Email:", req.user.email);
  res.json({ user: req.user });
});

// ❌ Public Route (ไม่ต้องใช้ Middleware)
router.post("/login", (req, res) => {
  // ไม่ต้องตรวจสอบ Token
});

🌐 Frontend Usage:
// JavaScript Example
const token = localStorage.getItem('token');
fetch('/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

📱 Testing with Postman:
1. Login → Get Token
2. Copy Token
3. Add Header: Authorization = Bearer <PASTE_TOKEN_HERE>
4. Test Protected Routes

🔍 Debug Tips:
1. Console.log req.user to see decoded data
2. Check JWT_KEY in .env file
3. Verify token expiration (24h default)
4. Test with jwt.io to decode token manually

⚠️  Common Errors:
1. "No token provided" → Missing Authorization header
2. "Invalid token" → Wrong JWT_KEY or expired token
3. "JsonWebTokenError" → Malformed token
4. "TokenExpiredError" → Token หมดอายุ (ต้อง login ใหม่)

🔒 Security Best Practices:
1. เก็บ Token ใน localStorage (Frontend)
2. ใช้ HTTPS ใน Production
3. ตั้งอายุ Token ให้เหมาะสม (ไม่เกิน 24h)
4. ลบ Token เมื่อ Logout
5. ตรวจสอบ Token ทุกครั้งก่อนเข้าถึง Protected Routes
==============================================================
*/