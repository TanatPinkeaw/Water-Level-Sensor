/*
==============================================================
                    WLS REGISTER PAGE COMPONENT
==============================================================
📝 Description: หน้าสมัครสมาชิกสำหรับ WLS (Water Level Sensor) System
🎯 Purpose: รับข้อมูลผู้ใช้ใหม่ → ส่งไป Backend → ส่งอีเมลยืนยัน → ไปหน้า Verify
🔧 Technologies: React + Axios + React Router + Framer Motion + Form Validation

📊 Component Flow:
1. รับ Input จากผู้ใช้ (Username, Email, Password, Confirm Password)
2. Validate ข้อมูลทั้งหมด (Client-side Validation)
3. ส่งข้อมูลไป Backend API
4. Backend ส่งอีเมลยืนยัน
5. Redirect ไปหน้า Verify

🔐 Validation Rules:
├── Username: 1-12 ตัวอักษร, ไม่มีอักขระพิเศษ
├── Email: รูปแบบอีเมลที่ถูกต้อง
├── Password: 8+ ตัวอักษร, มีตัวเลข
└── Confirm Password: ต้องตรงกับ Password

🌐 API Integration:
- POST /auth/register → สมัครสมาชิกและส่งอีเมลยืนยัน
==============================================================
*/

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { motion } from "framer-motion";

const Register = () => {
  // 📊 State Management
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");           // Error messages
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

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
                    ✅ CLIENT-SIDE VALIDATION
  ==============================================================
  📝 Purpose: ตรวจสอบข้อมูลก่อนส่งไป Backend
  📋 Validation Rules:
  ├── Username: ^[a-zA-Z0-9]{1,12}$ (1-12 ตัวอักษร, ไม่มีอักขระพิเศษ)
  ├── Password: ^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$ (8+ ตัวอักษร, มีตัวเลข)
  └── Confirm Password: ต้องตรงกับ Password
  
  📤 Return: true = ผ่าน, false = ไม่ผ่าน (แสดง Error)
  ==============================================================
  */
  const validateInputs = () => {
    const usernameRegex = /^[a-zA-Z0-9]{1,12}$/;     // Username pattern
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/; // Password pattern

    // 🔍 ตรวจสอบ Username
    if (!usernameRegex.test(values.username)) {
      setError("Username must be up to 12 characters and cannot contain special characters");
      return false;
    }

    // 🔍 ตรวจสอบ Password
    if (!passwordRegex.test(values.password)) {
      setError("Password must be at least 8 characters long and include numbers");
      return false;
    }

    // 🔍 ตรวจสอบ Confirm Password
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true; // ✅ ผ่านการตรวจสอบทั้งหมด
  };

  /*
  ==============================================================
                    🚀 REGISTER SUBMIT HANDLER
  ==============================================================
  📝 Purpose: ส่งข้อมูลสมัครสมาชิกไป Backend
  📥 Input: Form Data (username, email, password)
  📤 Output: Success Message หรือ Error Message
  
  🔄 Process Flow:
  1. Validate ข้อมูล (Client-side)
  2. เริ่ม Loading State
  3. ส่ง POST Request ไป /auth/register
  4. ถ้าสำเร็จ (201) → ไปหน้า Verify
  5. ถ้าผิดพลาด → แสดง Error Message
  6. จบ Loading State
  
  🔐 API Endpoint: POST /auth/register
  📊 Request Body: { username, email, password }
  📋 Response: { message }
  ==============================================================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ ตรวจสอบข้อมูลก่อน
    if (!validateInputs()) return;
    
    setIsLoading(true); // 🔄 เริ่ม Loading

    try {
      // 🌐 ส่ง Register Request
      const response = await axios.post(`${API_URL}/auth/register`, {
        username: values.username,
        email: values.email,
        password: values.password,
      });
      
      if (response.status === 201) {
        // ✅ Register สำเร็จ → ไปหน้า Verify
        navigate("/verify");
      }
    } catch (err) {
      // ❌ Register ล้มเหลว - จัดการ Error แต่ละประเภท
      if (err.response?.status === 404) {
        setError("Email not found"); // 📧 Email ไม่พบ (ไม่น่าเกิดใน Register)
      } else if (err.response?.status === 409) {
        setError("This email has already been created."); // 📧 Email ซ้ำ
      } else {
        setError("Something went wrong. Please try again."); // 🚫 Error อื่นๆ
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
                  id="register-pattern" 
                  x="0" 
                  y="0" 
                  width="60" 
                  height="60" 
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="30" cy="30" r="2" fill="white" fillOpacity="0.1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#register-pattern)"/>
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
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
              </svg>
            </motion.div>
            
            {/* 📢 Welcome Message */}
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Join Us Today
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed max-w-md">
              Create your account and start your amazing journey with our platform.
            </p>
            
            {/* ✨ Feature List */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Free to Join</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Instant Access</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-emerald-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Premium Features</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 📝 Right Pane - Register Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center"
        >
          <div className="w-full max-w-md mx-auto">
            {/* 📱 Mobile Welcome Message */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Us Today</h1>
              <p className="text-gray-600">Create your new account</p>
            </div>

            {/* 🖥️ Desktop Header */}
            <div className="hidden lg:block">
              <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600 mb-8">
                Fill in your information to get started
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

            {/* 📋 Register Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* 👤 Username Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={values.username}
                    onChange={handleChanges}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter your username"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Up to 12 characters, letters and numbers only
                  </p>
                </div>

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
                    placeholder="Create a password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    At least 8 characters with numbers
                  </p>
                </div>

                {/* 🔒 Confirm Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChanges}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {/* ✅ Terms & Conditions Checkbox */}
              <div className="flex items-center text-sm">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input type="checkbox" required className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5" />
                  <span className="text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
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
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* 🔗 Navigation Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

/*
==============================================================
                    📋 COMPONENT DOCUMENTATION
==============================================================

🔧 Props: ไม่มี

📊 State Variables:
├── values: { username, email, password, confirmPassword } → Form input values
├── error: string                                         → Error message
└── isLoading: boolean                                   → Loading state

🌐 API Calls:
└── POST /auth/register                                  → สมัครสมาชิก

🛣️ Navigation:
├── /verify                                             → หลัง Register สำเร็จ
└── /login                                             → ลิงก์เข้าสู่ระบบ

✅ Client-side Validation:
├── Username: ^[a-zA-Z0-9]{1,12}$                      → 1-12 ตัวอักษร
├── Password: ^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$         → 8+ ตัวอักษร + ตัวเลข
└── Confirm Password: ตรงกับ Password                   → ยืนยันรหัสผ่าน

🎨 UI Features:
├── Responsive Design                                   → Mobile + Desktop
├── Loading Spinner                                    → ขณะส่งข้อมูล
├── Error Messages                                     → แสดงข้อผิดพลาด
├── Form Validation                                    → Real-time validation
├── Terms & Conditions                                 → Checkbox จำเป็น
└── Smooth Animations                                  → Framer Motion

🐛 Error Handling:
├── 409: Email already exists                          → Email ซ้ำ
├── Validation Errors                                  → ข้อมูลไม่ถูกต้อง
└── Network Error                                      → ปัญหาการเชื่อมต่อ

⚠️  Security Features:
├── Client-side Validation                             → ตรวจสอบก่อนส่ง
├── Required Terms Agreement                           → ต้องยอมรับเงื่อนไข
└── Password Confirmation                              → ป้องกันพิมพ์ผิด

📧 Email Verification:
└── หลัง Register → Backend ส่งอีเมล → ไปหน้า Verify
==============================================================
*/