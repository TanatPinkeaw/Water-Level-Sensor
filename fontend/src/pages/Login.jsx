/*
==============================================================
                    WLS LOGIN PAGE COMPONENT
==============================================================
📝 Description: หน้าเข้าสู่ระบบสำหรับ WLS (Water Level Sensor) System
🎯 Purpose: รับข้อมูล Email/Password → ตรวจสอบกับ Backend → เก็บ JWT Token
🔧 Technologies: React + Axios + React Router + Framer Motion + Tailwind CSS

📊 Component Flow:
1. ตรวจสอบ Token ใน localStorage (Auto Login)
2. รับ Input จากผู้ใช้ (Email, Password)
3. ส่งข้อมูลไป Backend API
4. รับ JWT Token กลับมา
5. เก็บ Token ใน localStorage
6. Redirect ไปหน้า Dashboard

🔐 Authentication Flow:
Login → Get JWT Token → Store in localStorage → Navigate to Dashboard

⚠️  Error Handling:
- 404: Email ไม่มีในระบบ
- 401: รหัสผ่านผิด
- Network Error: ปัญหาการเชื่อมต่อ

🎨 UI Features:
- Responsive Design (Mobile + Desktop)
- Loading States with Spinner
- Error Messages with Icons
- Smooth Animations (Framer Motion)
- Form Validation
==============================================================
*/

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { motion } from "framer-motion";

const Login = () => {
  // 📊 State Management
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");           // Error messages
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  /*
  ==============================================================
                    🔍 AUTO LOGIN CHECK
  ==============================================================
  📝 Purpose: ตรวจสอบว่าผู้ใช้ Login อยู่แล้วหรือไม่
  🔄 Process: เช็ค JWT Token ใน localStorage → ถ้ามีให้ไปหน้า Dashboard
  ⏱️  Timing: รันเมื่อ Component Mount
  ==============================================================
  */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard"); // 🚀 Auto redirect ถ้ามี Token
    }
  }, [navigate]);

  /*
  ==============================================================
                    📝 FORM INPUT HANDLER
  ==============================================================
  📝 Purpose: จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  🔄 Process: อัปเดต State + ล้าง Error Message
  ==============================================================
  */
  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError(""); // 🧹 ล้าง Error เมื่อผู้ใช้พิมพ์ใหม่
  };

  /*
  ==============================================================
                    🚀 LOGIN SUBMIT HANDLER
  ==============================================================
  📝 Purpose: ส่งข้อมูล Login ไป Backend และจัดการ Response
  📥 Input: Form Data (email, password)
  📤 Output: JWT Token หรือ Error Message
  
  🔄 Process Flow:
  1. เริ่ม Loading State
  2. ส่ง POST Request ไป /auth/login
  3. ถ้าสำเร็จ (201) → เก็บ Token → ไปหน้า Dashboard
  4. ถ้าผิดพลาด → แสดง Error Message
  5. จบ Loading State
  
  🔐 API Endpoint: POST /auth/login
  📊 Request Body: { email, password }
  📋 Response: { token }
  ==============================================================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 🔄 เริ่ม Loading

    try {
      // 🌐 ส่ง Login Request
      const response = await axios.post(`${API_URL}/auth/login`, values);
      
      if (response.status === 201) {
        // ✅ Login สำเร็จ
        localStorage.setItem("token", response.data.token); // 💾 เก็บ JWT Token
        navigate("/dashboard"); // 🚀 ไปหน้า Dashboard
      }
    } catch (err) {
      // ❌ Login ล้มเหลว - จัดการ Error แต่ละประเภท
      if (err.response?.status === 404) {
        setError("This email has never been created."); // 📧 Email ไม่มีในระบบ
      } else if (err.response?.status === 401) {
        setError("Invalid email or password"); // 🔐 รหัสผ่านผิด
      } else {
        setError("Something went wrong"); // 🚫 Error อื่นๆ
      }
    } finally {
      setIsLoading(false); // 🔄 จบ Loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* 🎨 Left Pane - Welcome Section (Desktop Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 flex-col justify-center items-center text-white relative overflow-hidden"
        >
          {/* 🌟 Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg 
              className="w-full h-full" 
              xmlns="http://www.w3.org/2000/svg" 
              width="60" 
              height="60" 
              viewBox="0 0 60 60"
            >
              <defs>
                <pattern 
                  id="pattern" 
                  x="0" 
                  y="0" 
                  width="60" 
                  height="60" 
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="30" cy="30" r="2" fill="white" fillOpacity="0.1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern)"/>
            </svg>
          </div>
          
          <div className="relative z-10 text-center">
            {/* 🎯 Animated Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-sm"
            >
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </motion.div>
            
            {/* 📢 Welcome Message */}
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Welcome Back
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed max-w-md">
              Sign in to access your account and continue your journey with us.
            </p>
            
            {/* ✨ Feature List */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 📝 Right Pane - Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center"
        >
          <div className="w-full max-w-md mx-auto">
            {/* 📱 Mobile Welcome Message */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {/* 🖥️ Desktop Header */}
            <div className="hidden lg:block">
              <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600 mb-8">
                Enter your credentials to access your account
              </p>
            </div>

            {/* ⚠️ Error Message Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center space-x-2"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}

            {/* 📋 Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* 📧 Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChanges}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter your email"
                  />
                </div>

                {/* 🔐 Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChanges}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* 🔗 Additional Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* 🚀 Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* 🔗 Navigation Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

/*
==============================================================
                    📋 COMPONENT DOCUMENTATION
==============================================================

🔧 Props: ไม่มี

📊 State Variables:
├── values: { email, password }     → Form input values
├── error: string                   → Error message to display
└── isLoading: boolean             → Loading state for submit button

🌐 API Calls:
└── POST /auth/login               → ส่งข้อมูล Login

🛣️ Navigation:
├── /dashboard                     → หลัง Login สำเร็จ
└── /register                      → ลิงก์สมัครสมาชิก

💾 Local Storage:
└── token                          → JWT Token หลัง Login สำเร็จ

🎨 UI Features:
├── Responsive Design              → Mobile + Desktop
├── Loading Spinner               → ขณะส่งข้อมูล
├── Error Messages               → แสดงข้อผิดพลาด
├── Form Validation             → HTML5 + Custom validation
└── Smooth Animations           → Framer Motion

🐛 Error Handling:
├── 404: Email not found         → Email ไม่มีในระบบ
├── 401: Wrong password         → รหัสผ่านผิด
└── Network Error              → ปัญหาการเชื่อมต่อ

⚠️  Dependencies:
├── react-router-dom           → Navigation
├── axios                     → HTTP requests
├── framer-motion            → Animations
└── ../config               → API URL configuration

🔮 Future Improvements:
├── Social Login (Google, Facebook)
├── Two-Factor Authentication
├── Password Strength Indicator
├── Captcha Verification
└── Biometric Login (Fingerprint)
==============================================================
*/
