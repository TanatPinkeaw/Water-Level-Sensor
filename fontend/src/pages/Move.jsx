/*
==============================================================
                    WLS REDIRECT CONTROLLER
==============================================================
📝 Description: Component สำหรับควบคุมการ Redirect ตาม Authentication Status
🎯 Purpose: ตรวจสอบ JWT Token → Redirect ไป Dashboard หรือ Login
🔧 Technologies: React + React Router + Local Storage

📊 Component Logic:
1. ตรวจสอบ JWT Token ใน localStorage
2. หากมี Token → Redirect ไป /dashboard
3. หากไม่มี Token → Redirect ไป /login
4. ไม่แสดง UI ใดๆ (return null)

🛣️ Use Cases:
├── Root Route (/) → Auto redirect
├── Protected Route fallback → หากมีปัญหา Auth
├── Landing Page → สำหรับผู้ใช้ที่ไม่แน่ใจสถานะ
└── Error Recovery → กรณี Auth state ผิดพลาด

⚡ Performance:
- ไม่มี UI rendering → เร็วมาก
- ใช้ useEffect เพียงครั้งเดียว
- Auto cleanup และ redirect ทันที
==============================================================
*/

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Move = () => {
  const navigate = useNavigate();

  /*
  ==============================================================
                    🔍 AUTHENTICATION CHECK & REDIRECT
  ==============================================================
  📝 Purpose: ตรวจสอบสถานะการเข้าสู่ระบบและ Redirect ทันที
  📥 Input: JWT Token จาก localStorage
  📤 Output: Navigation ไปหน้าที่เหมาะสม
  
  🔄 Process Flow:
  1. อ่าน JWT Token จาก localStorage
  2. ตรวจสอบว่ามี Token หรือไม่
  3. หากมี Token → navigate("/dashboard")
  4. หากไม่มี Token → navigate("/login")
  
  ⏱️ Timing: รันทันทีเมื่อ Component Mount
  
  🎯 Benefits:
  - User Experience ดี (ไม่ต้องเลือกหน้าเอง)
  - ป้องกัน Unauthorized Access
  - Central Authentication Logic
  - Clean URL routing
  
  ⚠️ Important Notes:
  - Component นี้ไม่ validate Token expiration
  - ใช้สำหรับ Basic Authentication Check เท่านั้น
  - Token validation จริงทำที่ Backend
  ==============================================================
  */
  useEffect(() => {
    // 🔍 อ่าน JWT Token จาก localStorage
    const token = localStorage.getItem("token");
    
    if (token) {
      // ✅ มี Token → ถือว่า User login แล้ว
      navigate("/dashboard"); // 🚀 ไปหน้า Dashboard
    } else {
      // ❌ ไม่มี Token → User ยังไม่ login
      navigate("/login");     // 🚀 ไปหน้า Login
    }
  }, [navigate]); // Dependency: navigate (จาก useNavigate hook)

  /*
  ==============================================================
                    🎨 NO UI RENDERING
  ==============================================================
  📝 Purpose: Component นี้ไม่แสดง UI ใดๆ
  📤 Output: null (ไม่ render อะไรเลย)
  
  ⚡ Benefits:
  - Performance ดี (ไม่มี DOM rendering)
  - User ไม่เห็น Loading หรือ Flash content
  - Redirect เร็วทันที
  
  🔄 Alternative Approaches:
  - Loading Spinner (หากต้องการแสดง Loading)
  - Skeleton UI (หากต้องการ placeholder)
  - Error Boundary (หากต้องการ Error handling)
  ==============================================================
  */
  return null; // 🚫 ไม่แสดง UI ใดๆ (เพื่อ Performance และ UX)
};

export default Move;

/*
==============================================================
                    📋 COMPONENT DOCUMENTATION
==============================================================

🔧 Props: ไม่มี

📊 State Variables: ไม่มี

🌐 API Calls: ไม่มี

🛣️ Navigation:
├── /dashboard → หากมี JWT Token
└── /login     → หากไม่มี JWT Token

💾 Local Storage:
└── token → ตรวจสอบการมีอยู่ของ JWT Token

🎨 UI Features:
└── ไม่มี UI (return null)

🔄 Lifecycle:
├── Mount → ตรวจสอบ Token ทันที
├── Effect → Redirect ตาม Token status
└── Unmount → Auto cleanup

⚠️ Use Cases:
├── Root Route (/) → Auto redirect homepage
├── Authentication Fallback → กรณี Auth state unclear
├── Error Recovery → Redirect เมื่อมีปัญหา
└── Development/Testing → ทดสอบ Authentication flow

🔮 Possible Improvements:
├── Token Validation → ตรวจสอบ Token expiration
├── Loading State → แสดง Loading ระหว่าง redirect
├── Error Handling → จัดการ Error ในการ redirect
├── Analytics → ติดตาม redirect patterns
└── Route History → เก็บ history สำหรับ back navigation

🎯 Alternative Names:
├── AuthRedirect → ชื่อที่อธิบายหน้าที่ชัดเจนกว่า
├── RouteController → ควบคุม routing
├── AuthGate → ประตูการตรวจสอบ auth
└── NavigationController → ควบคุมการนำทาง

⚡ Performance Notes:
- Lightweight Component (ไม่มี heavy operations)
- Fast execution (เพียง localStorage read)
- No re-renders (return null)
- Efficient routing (direct navigation)
==============================================================
*/