# 🌐 WLS FRONTEND DOCUMENTATION

```
==============================================================
                    WLS FRONTEND APPLICATION
==============================================================
📝 Description: React Frontend สำหรับ WLS (Water Level Sensor) Monitoring System
🎯 Purpose: ส่วน User Interface สำหรับจัดการผู้ใช้และแสดงข้อมูลเซ็นเซอร์
🔧 Technologies: React 18 + Vite + React Router + Axios + Chart.js

🌐 URLs:
- Development: http://localhost:5173
- Production: http://wls-sensor-data.duckdns.org

⚠️  Important Notes:
1. ใช้ Vite แทน Create React App (เร็วกว่า)
2. Backend ต้องรันก่อน Frontend เสมอ
3. API Base URL อยู่ในไฟล์ config.js
4. ชื่อโฟลเดอร์ควรเป็น "frontend" แต่ตอนนี้เป็น "fontend"
==============================================================
```

## 📂 โครงสร้างโฟลเดอร์และไฟล์

### 🏗️ **Root Level Files**
```
fontend/
├── .gitignore           → ไฟล์ที่ไม่ต้องอัปโหลด Git
├── eslint.config.js     → การตั้งค่า ESLint (Code Quality)
├── index.html           → HTML Template หลัก
├── package.json         → Dependencies และ Scripts
├── README.md            → เอกสารคำแนะนำ
└── vite.config.js       → การตั้งค่า Vite Build Tool
```

### 📁 **Public Folder** (`/public`)
```
public/
├── BGG.jpg              → รูปพื้นหลัง (JPG format)
├── BGG.png              → รูปพื้นหลัง (PNG format)
└── vite.svg             → Logo Vite (Default)
```
**Purpose**: เก็บไฟล์ Static ที่เข้าถึงได้โดยตรงผ่าน URL

### 📁 **Source Folder** (`/src`)
```
src/
├── App.jsx              → Component หลักของแอป
├── config.js            → การตั้งค่า API URL
├── index.css            → CSS Styles หลัก
├── main.jsx             → Entry Point ของแอป
├── assets/              → ไฟล์ภาพและ Resources
├── components/          → Reusable Components
└── pages/               → หน้าต่างๆ ของแอป
```

## 🔧 **ไฟล์หลักและการทำงาน**

### 🚀 **main.jsx** - Entry Point
```javascript
// เริ่มต้น React Application
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Render App Component ไปยัง DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 📱 **App.jsx** - Main Component
```javascript
// การจัดการ Routing และ Layout หลัก
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
// ... other imports

// กำหนด Routes สำหรับหน้าต่างๆ
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        // ... other routes
      </Routes>
    </BrowserRouter>
  )
}
```

### ⚙️ **config.js** - API Configuration
```javascript
// การตั้งค่า Backend API URL
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://wls-sensor-data.duckdns.org:3000'  // Production URL
  : 'http://localhost:3000';                   // Development URL

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY: '/auth/verify',
  SENSOR_DATA: '/auth/sensor-data',
  PROFILE: '/auth/profile'
}
```

## 🧩 **Components** (`/src/components`)

### 🧭 **Navbar.jsx** - Navigation Bar
```
Purpose: แถบนำทางด้านบน
Features:
├── Logo และ Brand Name
├── เมนูหลัก (Dashboard, Profile, etc.)
├── User Avatar และ Dropdown
└── Logout Button
```

### 📱 **Sidebar.jsx** - Side Navigation
```
Purpose: เมนูด้านข้าง (ใช้ในหน้า Dashboard)
Features:
├── Navigation Links
├── User Information
├── Quick Stats
└── Collapse/Expand Function
```

## 📄 **Pages** (`/src/pages`)

### 🔐 **Authentication Pages**

#### **Login.jsx** - หน้าเข้าสู่ระบบ
```
Features:
├── Email/Password Input
├── Remember Me Checkbox
├── Form Validation
├── Error Handling
├── Link to Register
└── JWT Token Storage
```

#### **Register.jsx** - หน้าสมัครสมาชิก
```
Features:
├── Username, Email, Password Input
├── Password Confirmation
├── Form Validation
├── Email Verification Process
└── Success/Error Messages
```

#### **Verify.jsx** - หน้ายืนยันอีเมล
```
Features:
├── Verification Code Input (6 digits)
├── Auto-focus Input Fields
├── Resend Code Function
├── Timer Countdown
└── Success Redirect
```

### 📊 **Main Application Pages**

#### **Dashboard.jsx** - หน้าหลัก
```
Features:
├── Sensor Data Visualization
├── Real-time Charts (Chart.js)
├── Data Tables
├── Filter Options (Date, Node, Type)
├── Export Functions
└── Responsive Layout
```

#### **Profile.jsx** - หน้าโปรไฟล์
```
Features:
├── User Information Display
├── Edit Profile Form
├── Profile Picture Upload
├── Password Change
├── Account Settings
└── Send User ID Email
```

#### **Move.jsx** - หน้าเพิ่มเติม
```
Purpose: หน้าสำหรับฟีเจอร์เพิ่มเติม
Note: ต้องดูโค้ดเพื่อทราบฟีเจอร์ที่แน่นอน
```

## 🎨 **Styling** (`/src/index.css`)

### 🌈 **CSS Structure**
```css
/* Global Styles */
:root {
  /* CSS Variables for Colors, Fonts, etc. */
}

/* Component Styles */
.navbar { /* Navigation Bar Styles */ }
.sidebar { /* Sidebar Styles */ }
.dashboard { /* Dashboard Layout */ }
.form-container { /* Form Styles */ }

/* Responsive Design */
@media (max-width: 768px) {
  /* Mobile Styles */
}
```

## 📦 **Dependencies** (`package.json`)

### 🔧 **Main Dependencies**
```json
{
  "dependencies": {
    "react": "^18.x.x",           // React Library
    "react-dom": "^18.x.x",       // React DOM
    "react-router-dom": "^6.x.x", // Routing
    "axios": "^1.x.x",            // HTTP Client
    "chart.js": "^4.x.x",         // Charts
    "react-chartjs-2": "^5.x.x"   // React Chart.js Wrapper
  },
  "devDependencies": {
    "vite": "^5.x.x",             // Build Tool
    "eslint": "^8.x.x",           // Code Linting
    "@types/react": "^18.x.x"     // TypeScript Types
  }
}
```

### 🚀 **Scripts**
```json
{
  "scripts": {
    "dev": "vite",                 // เริ่มต้น Development Server
    "build": "vite build",         // Build สำหรับ Production
    "preview": "vite preview",     // Preview Build Results
    "lint": "eslint src"           // ตรวจสอบ Code Quality
  }
}
```

## 🌐 **API Integration**

### 📡 **HTTP Client Setup** (Axios)
```javascript
// การตั้งค่า Axios Instance
import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// JWT Token Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 🔐 **Authentication Flow**
```
1. Login → Get JWT Token → Store in localStorage
2. Dashboard → Check Token → Redirect if invalid
3. API Calls → Include Authorization Header
4. Logout → Remove Token → Redirect to Login
```

### 📊 **Data Fetching**
```javascript
// Example: Fetch Sensor Data
const fetchSensorData = async () => {
  try {
    const response = await api.get('/auth/sensor-data');
    setSensorData(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

## 🛠️ **Development Commands**

### 🚀 **Quick Start**
```bash
# ติดตั้ง Dependencies
npm install

# เริ่มต้น Development Server
npm run dev

# เปิดในเบราว์เซอร์
http://localhost:5173
```

### 🏗️ **Build Commands**
```bash
# Build สำหรับ Production
npm run build

# Preview Production Build
npm run preview

# ตรวจสอบ Code Quality
npm run lint
```

## 🐛 **Common Issues & Solutions**

### ❌ **Frontend ไม่เชื่อมต่อ Backend**
```
Problem: CORS Error หรือ Network Error
Solutions:
1. ตรวจสอบ Backend Server running (http://localhost:3000)
2. เช็ค API_BASE_URL ในไฟล์ config.js
3. ตรวจสอบ CORS setting ใน Backend
4. เช็ค Network Connection
```

### ❌ **Authentication Issues**
```
Problem: Token Invalid หรือ Unauthorized
Solutions:
1. เช็ค JWT Token ใน localStorage
2. ตรวจสอบ Token expiration (24 hours)
3. Login ใหม่หากจำเป็น
4. เช็ค Authorization Header ใน API calls
```

### ❌ **Build Errors**
```
Problem: Vite Build Failed
Solutions:
1. ลบ node_modules และ npm install ใหม่
2. ตรวจสอบ Dependencies versions
3. เช็ค ESLint errors
4. ตรวจสอบ Import/Export statements
```

## 📱 **Responsive Design**

### 🖥️ **Desktop Layout**
```
- Navbar: Fixed top navigation
- Sidebar: Collapsible side menu
- Main Content: Dashboard with charts
- Footer: Optional information
```

### 📱 **Mobile Layout**
```
- Navbar: Hamburger menu
- Sidebar: Overlay/drawer
- Charts: Responsive scaling
- Forms: Touch-friendly inputs
```

## 🔮 **Future Development**

### 🚀 **Suggested Improvements**
```
1. TypeScript Integration
2. Progressive Web App (PWA)
3. Dark/Light Theme Toggle
4. Real-time WebSocket Updates
5. Advanced Data Filtering
6. Export to Excel/PDF
7. Push Notifications
8. Multi-language Support
```

### 📈 **Performance Optimization**
```
1. Code Splitting (React.lazy)
2. Image Optimization
3. Bundle Size Analysis
4. Caching Strategies
5. Service Worker
```

## 🔐 **Security Best Practices**

### 🛡️ **Frontend Security**
```
1. Validate all user inputs
2. Sanitize data before display
3. Use HTTPS in production
4. Implement CSP (Content Security Policy)
5. Regular dependency updates
6. Secure token storage
```

---

## 📞 **Need Help?**

### 🔍 **Debug Tools**
- **React Developer Tools** (Browser Extension)
- **Redux DevTools** (if using Redux)
- **Network Tab** (Browser Dev Tools)
- **Console Logs** (Browser Dev Tools)

### 📚 **Documentation Links**
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Chart.js](https://www.chartjs.org/)

### ⚠️ **Important Notes**
1. **Folder Name**: ปัจจุบันเป็น "fontend" ควรเปลี่ยนเป็น "frontend"
2. **Environment**: ตั้งค่า Environment Variables สำหรับ Production
3. **API Keys**: ห้ามใส่ API Keys ใน Frontend Code
4. **Error Handling**: เพิ่ม Global Error Boundary
5. **Loading States**: ใส่ Loading Spinners สำหรับ UX ที่ดี

---
**📅 Last Updated**: September 2025  
**👨‍💻 Maintainer**: WLS Development Team  
**📧 Contact**: [Contact Information]