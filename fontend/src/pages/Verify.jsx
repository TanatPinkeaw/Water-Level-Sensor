/*
==============================================================
                    WLS EMAIL VERIFICATION PAGE
==============================================================
📝 Description: หน้ายืนยันอีเมลสำหรับ WLS (Water Level Sensor) System
🎯 Purpose: รับรหัสยืนยัน 6 หลัก → ส่งไป Backend → ยืนยันอีเมล → ไปหน้า Login
🔧 Technologies: React + Axios + React Router + Framer Motion

📊 Component Flow:
1. รับ Email และ Verification Code จากผู้ใช้
2. ส่งข้อมูลไป Backend API (/auth/verify)
3. Backend ตรวจสอบรหัสยืนยัน
4. หากถูกต้อง → อัปเดต is_verified = 1
5. Redirect ไปหน้า Login

🔐 Verification Process:
├── รหัสยืนยัน 6 หลัก (ส่งมาทางอีเมล)
├── ตรวจสอบกับฐานข้อมูล
├── หมดอายุภายใน 1 นาที (Auto cleanup)
└── สามารถส่งรหัสใหม่ได้

🌐 API Integration:
- POST /auth/verify → ยืนยันอีเมล
- POST /auth/resend-verification → ส่งรหัสใหม่
==============================================================
*/

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
import { motion } from "framer-motion";

const Verify = () => {
  // 📊 State Management
  const [values, setValues] = useState({ email: "", verificationCode: "" });
  const [message, setMessage] = useState("");           // Success/Error messages
  const [resendMessage, setResendMessage] = useState(""); // Resend messages
  const [isLoading, setIsLoading] = useState(false);     // Loading state for verify
  const [isResending, setIsResending] = useState(false); // Loading state for resend
  const navigate = useNavigate();

  /*
  ==============================================================
                    📝 FORM INPUT HANDLER
  ==============================================================
  📝 Purpose: จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  🔄 Process: อัปเดต State + ล้าง Messages
  ==============================================================
  */
  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setMessage("");      // 🧹 ล้าง Message เมื่อผู้ใช้พิมพ์ใหม่
    setResendMessage(""); // 🧹 ล้าง Resend Message
  };

  /*
  ==============================================================
                    ✅ VERIFY EMAIL HANDLER
  ==============================================================
  📝 Purpose: ส่งรหัสยืนยันไป Backend เพื่อยืนยันอีเมล
  📥 Input: { email, verificationCode }
  📤 Output: Success Message หรือ Error Message
  
  🔄 Process Flow:
  1. เริ่ม Loading State
  2. ส่ง POST Request ไป /auth/verify
  3. ถ้าสำเร็จ → แสดง Success Message → ไปหน้า Login (2 วินาที)
  4. ถ้าผิดพลาด → แสดง Error Message
  5. จบ Loading State
  
  🔐 API Endpoint: POST /auth/verify
  📊 Request Body: { email, verificationCode }
  📋 Response: { message }
  ==============================================================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 🔄 เริ่ม Loading

    try {
      // 🌐 ส่ง Verify Request
      const response = await axios.post(`${API_URL}/auth/verify`, values);
      
      // ✅ Verify สำเร็จ
      setMessage(response.data.message);
      
      // ⏱️ Auto redirect หลัง 2 วินาที
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // ❌ Verify ล้มเหลว
      setMessage(error.response?.data?.message || "Error verifying email");
    } finally {
      setIsLoading(false); // 🔄 จบ Loading
    }
  };

  /*
  ==============================================================
                    📧 RESEND VERIFICATION CODE HANDLER
  ==============================================================
  📝 Purpose: ส่งรหัสยืนยันใหม่ไปยังอีเมล
  📥 Input: Email จาก Form
  📤 Output: Success/Error Message
  
  🔄 Process Flow:
  1. ตรวจสอบว่ามี Email หรือไม่
  2. เริ่ม Loading State
  3. ส่ง POST Request ไป /auth/resend-verification
  4. แสดง Response Message
  5. จบ Loading State
  
  🔐 API Endpoint: POST /auth/resend-verification
  📊 Request Body: { email }
  📋 Response: { message }
  
  ⚠️  Validation:
  - ต้องกรอก Email ก่อนจึงจะส่งได้
  ==============================================================
  */
  const handleResend = async () => {
    // 🔍 ตรวจสอบว่ามี Email หรือไม่
    if (!values.email) {
      setResendMessage("Please enter your email first");
      return;
    }

    setIsResending(true); // 🔄 เริ่ม Loading
    
    try {
      // 📧 ส่ง Resend Request
      const response = await axios.post(
        `${API_URL}/auth/resend-verification`,
        { email: values.email }
      );
      
      // ✅ Resend สำเร็จ
      setResendMessage(response.data.message);
    } catch (error) {
      // ❌ Resend ล้มเหลว
      setResendMessage(
        error.response?.data?.message || "Error resending verification email"
      );
    } finally {
      setIsResending(false); // 🔄 จบ Loading
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
                  id="verify-pattern"
                  x="0"
                  y="0"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="30"
                    cy="30"
                    r="2"
                    fill="white"
                    fillOpacity="0.1"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="url(#verify-pattern)"
              />
            </svg>
          </div>

          <div className="relative z-10 text-center">
            {/* 🎯 Animated Email Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-sm"
            >
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>

            {/* 📢 Welcome Message */}
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Check Your Email
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed max-w-md">
              We've sent a verification code to your email address. Please check
              your inbox and enter the code below.
            </p>

            {/* ✨ Feature List */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure Verification</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Quick & Easy</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Almost Done!</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 📝 Right Pane - Verify Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center"
        >
          <div className="w-full max-w-md mx-auto">
            
            {/* 📱 Mobile Welcome Message */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600">Enter verification code</p>
            </div>

            {/* 🖥️ Desktop Header */}
            <div className="hidden lg:block">
              <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
                Verify Email
              </h2>
              <p className="text-gray-600 mb-8">
                Enter the verification code sent to your email
              </p>
            </div>

            {/* ✅ Success Message Display */}
            {message && !message.includes("Error") && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{message}</span>
              </motion.div>
            )}

            {/* ❌ Error Message Display */}
            {message && message.includes("Error") && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{message}</span>
              </motion.div>
            )}

            {/* 📧 Resend Message Display */}
            {resendMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl text-sm flex items-center space-x-2 ${
                  resendMessage.includes("Error") || resendMessage.includes("enter")
                    ? "bg-red-50 border border-red-200 text-red-600"      // Error styling
                    : "bg-blue-50 border border-blue-200 text-blue-600"   // Success styling
                }`}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{resendMessage}</span>
              </motion.div>
            )}

            {/* 📋 Verify Form */}
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

                {/* 🔢 Verification Code Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={values.verificationCode}
                    onChange={handleChanges}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-center text-lg tracking-widest"
                    placeholder="Enter 6-digit code"
                    maxLength="6"  // จำกัดความยาว 6 หลัก
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Check your email for the 6-digit verification code
                  </p>
                </div>
              </div>

              {/* 🚀 Verify Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            {/* 📧 Resend Code Button */}
            <div className="mt-6">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Resend Verification Code"
                )}
              </button>
            </div>

            {/* 🔗 Navigation Links */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
              <Link
                to="/register"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200 text-center"
              >
                ← Back to Register
              </Link>
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200 text-center"
              >
                Sign In Instead →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;

/*
==============================================================
                    📋 COMPONENT DOCUMENTATION
==============================================================

🔧 Props: ไม่มี

📊 State Variables:
├── values: { email, verificationCode }  → Form input values
├── message: string                      → Verify success/error message
├── resendMessage: string               → Resend success/error message
├── isLoading: boolean                  → Loading state for verify
└── isResending: boolean               → Loading state for resend

🌐 API Calls:
├── POST /auth/verify                  → ยืนยันอีเมล
└── POST /auth/resend-verification     → ส่งรหัสใหม่

🛣️ Navigation:
├── /login                            → หลัง Verify สำเร็จ (Auto redirect 2s)
├── /register                         → Back to Register
└── /login                           → Sign In Instead

🔢 Code Format:
└── 6-digit verification code         → รหัสยืนยัน 6 หลัก

🎨 UI Features:
├── Responsive Design                 → Mobile + Desktop
├── Loading Spinners                 → ขณะส่งข้อมูล
├── Success/Error Messages          → แสดงผลลัพธ์
├── Resend Functionality           → ส่งรหัสใหม่
└── Smooth Animations             → Framer Motion

📧 Email Verification Flow:
├── Register → Email sent           → รับอีเมลยืนยัน
├── Enter code → Verify            → ป้อนรหัสและยืนยัน
├── Success → is_verified = 1      → อัปเดตสถานะในฐานข้อมูล
└── Redirect → Login page         → ไปหน้า Login

⏱️ Auto Features:
├── Redirect after 2 seconds      → Auto นำไปหน้า Login
├── Clear messages on input       → ล้าง Message เมื่อพิมพ์ใหม่
└── Code expiration (1 minute)    → รหัสหมดอายุ 1 นาที

🐛 Error Handling:
├── Invalid verification code      → รหัสไม่ถูกต้อง
├── Expired code                  → รหัสหมดอายุ
├── Email not found              → Email ไม่มีในระบบ
├── Network error               → ปัญหาการเชื่อมต่อ
└── Email required for resend   → ต้องกรอก Email ก่อนส่งใหม่

🔐 Security Features:
├── Code length validation        → จำกัด 6 หลัก
├── Auto cleanup expired codes   → ลบรหัสหมดอายุอัตโนมัติ
└── Rate limiting (Backend)      → จำกัดการส่งรหัสบ่อยเกินไป
==============================================================
*/
