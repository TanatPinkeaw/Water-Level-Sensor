/*
==============================================================
                    WLS USER PROFILE PAGE
==============================================================
📝 Description: หน้าจัดการโปรไฟล์ผู้ใช้สำหรับ WLS (Water Level Sensor) System
🎯 Purpose: แสดงและแก้ไขข้อมูลส่วนตัว → อัปโหลดรูปโปรไฟล์ → เปลี่ยนรหัสผ่าน
🔧 Technologies: React + Axios + Protected Route + File Upload + Form Validation

📊 Component Features:
├── แสดงข้อมูลผู้ใช้ (ID, Name, Email, Profile Picture)
├── อัปโหลดรูปโปรไฟล์ใหม่
├── แก้ไขชื่อผู้ใช้
├── เปลี่ยนรหัสผ่าน (ต้องใส่รหัสเก่า)
└── ส่ง User ID ไปทางอีเมล (สำหรับ ESP32)

🔐 Protected Route:
- ต้องมี JWT Token ใน localStorage
- Auto redirect ไป /login หากไม่มี Token

🌐 API Integration:
- GET /auth/user-info → ดึงข้อมูลผู้ใช้
- POST /auth/profile/upload-picture → อัปโหลดรูป
- PUT /auth/profile/update-name → อัปเดตชื่อ
- PUT /auth/profile/update-password → เปลี่ยนรหัสผ่าน
- POST /auth/send-user-id → ส่ง User ID ทางอีเมล
==============================================================
*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const Profile = () => {
  // 📊 State Management
  const [userId, setUserId] = useState("");               // User ID (ซ่อนไว้)
  const [profilePicture, setProfilePicture] = useState(null); // รูปโปรไฟล์
  const [name, setName] = useState("");                   // ชื่อผู้ใช้
  const [email, setEmail] = useState("");                 // อีเมล (แสดงอย่างเดียว)
  const [oldPassword, setOldPassword] = useState("");     // รหัสผ่านเก่า
  const [newPassword, setNewPassword] = useState("");     // รหัสผ่านใหม่
  const [confirmPassword, setConfirmPassword] = useState(""); // ยืนยันรหัสผ่าน
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state
  const [isUserIdVisible, setIsUserIdVisible] = useState(false); // User ID visibility (ไม่ได้ใช้)
  const [notification, setNotification] = useState("");    // Notification message
  const [notificationType, setNotificationType] = useState(""); // success/error
  const navigate = useNavigate();

  /*
  ==============================================================
                    🔄 FETCH USER DATA ON MOUNT
  ==============================================================
  📝 Purpose: ดึงข้อมูลผู้ใช้เมื่อ Component โหลด
  📥 Input: JWT Token จาก localStorage
  📤 Output: User data (id, username, email, profile_picture)
  
  🔄 Process Flow:
  1. ตรวจสอบ JWT Token
  2. หากไม่มี Token → Redirect ไป /login
  3. ส่ง GET Request พร้อม Authorization Header
  4. อัปเดต State ด้วยข้อมูลที่ได้รับ
  5. ปรับ URL รูปโปรไฟล์ให้เป็น Full URL
  
  🔐 API Endpoint: GET /auth/user-info
  📋 Response: { id, username, email, profile_picture }
  ==============================================================
  */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 🔍 ตรวจสอบ JWT Token
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login"); // 🚀 Redirect หากไม่มี Token
          return;
        }

        // 🌐 เรียก API เพื่อดึงข้อมูล User
        const response = await axios.get(
          `${API_URL}/auth/user-info`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // 🔐 ส่ง JWT Token
            },
          }
        );

        // 📊 แยกข้อมูลจาก Response
        const { id, username, email, profile_picture } = response.data;

        // 📝 อัปเดต State
        setUserId(id);
        setName(username);
        setEmail(email);

        // 🖼️ ตรวจสอบและปรับ URL ของรูปภาพ
        const fullProfilePictureUrl = profile_picture
          ? `${API_URL}/${profile_picture}`     // 🔗 เพิ่ม Base URL
          : "/default-profile.png";            // 🖼️ ใช้รูป Default หากไม่มี
        setProfilePicture(fullProfilePictureUrl);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // TODO: แสดง Error Message หรือ Redirect ไป Login
      }
    };

    fetchUserData();
  }, []); // รันครั้งเดียวเมื่อ Component Mount

  /*
  ==============================================================
                    📸 PROFILE PICTURE UPLOAD HANDLER
  ==============================================================
  📝 Purpose: จัดการการอัปโหลดรูปโปรไฟล์ใหม่
  📥 Input: File จาก Input Element
  📤 Output: อัปเดตรูปโปรไฟล์ในฐานข้อมูลและแสดงผล
  
  🔄 Process Flow:
  1. สร้าง Preview URL จากไฟล์ที่เลือก
  2. สร้าง FormData สำหรับส่งไฟล์
  3. ส่ง POST Request พร้อมไฟล์
  4. อัปเดต State ด้วยรูปใหม่
  
  🔐 API Endpoint: POST /auth/profile/upload-picture
  📄 Content-Type: multipart/form-data
  📋 Form Data: { profilePicture: File }
  ==============================================================
  */
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]; // 📁 ดึงไฟล์ที่เลือก
    
    if (!file) return; // 🚫 หากไม่มีไฟล์ให้ออกจากฟังก์ชัน
    
    // 🖼️ สร้าง Preview URL สำหรับแสดงผลทันที
    const previewUrl = URL.createObjectURL(file);
    
    // 📦 สร้าง FormData สำหรับส่งไฟล์
    const formData = new FormData();
    formData.append("profilePicture", file);
    
    try {
      // 🌐 ส่งไฟล์ไป Backend
      const response = await axios.post(
        `${API_URL}/auth/profile/upload-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔐 JWT Token
            // Content-Type: multipart/form-data จะตั้งอัตโนมัติ
          },
        }
      );
      
      // ✅ อัปโหลดสำเร็จ - อัปเดต State ด้วย Path จาก Server
      setProfilePicture(`${API_URL}/${response.data.filePath}`);
      
      // 📢 แสดง Success Message
      setNotificationType("success");
      setNotification("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      
      // ❌ แสดง Error Message
      setNotificationType("error");
      setNotification("Failed to upload profile picture.");
    }
    
    // 🖼️ แสดง Preview ไม่ว่าจะอัปโหลดสำเร็จหรือไม่
    setProfilePicture(previewUrl);
  };

  /*
  ==============================================================
                    📝 PROFILE UPDATE FORM HANDLER
  ==============================================================
  📝 Purpose: จัดการการอัปเดตข้อมูลโปรไฟล์ (ชื่อ + รหัสผ่าน)
  📥 Input: Form data (name, oldPassword, newPassword, confirmPassword)
  📤 Output: อัปเดตข้อมูลในฐานข้อมูล
  
  🔄 Process Flow:
  1. Validate ข้อมูลทั้งหมด (Client-side)
  2. อัปเดตชื่อ (PUT /auth/profile/update-name)
  3. อัปเดตรหัสผ่าน (หากมีการกรอก)
  4. แสดง Success Message และ Refresh หน้า
  
  ✅ Validation Rules:
  ├── Username: ^[a-zA-Z0-9]{1,12}$ (1-12 ตัวอักษร)
  ├── Password: ^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$ (8+ ตัวอักษร + ตัวเลข)
  └── Confirm Password: ต้องตรงกับ newPassword
  ==============================================================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 📋 Regex patterns สำหรับ Validation
    const usernameRegex = /^[a-zA-Z0-9]{1,12}$/;     // Username: 1-12 ตัวอักษร
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/; // Password: 8+ ตัวอักษร + ตัวเลข

    // ✅ ตรวจสอบ Username
    if (!usernameRegex.test(name)) {
      setNotificationType("error");
      setNotification(
        "Username must be up to 12 characters and cannot contain special characters."
      );
      return;
    }

    // ✅ ตรวจสอบ Password (ถ้ามีการกรอก)
    if (newPassword && !passwordRegex.test(newPassword)) {
      setNotificationType("error");
      setNotification(
        "Password must be at least 8 characters long and include both letters and numbers."
      );
      return;
    }

    // ✅ ตรวจสอบ Password Confirmation
    if (newPassword && newPassword !== confirmPassword) {
      setNotificationType("error");
      setNotification("Passwords do not match.");
      return;
    }

    try {
      // 🌐 อัปเดตชื่อ
      await axios.put(
        `${API_URL}/auth/profile/update-name`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 🔐 อัปเดตรหัสผ่าน (ถ้ามีการกรอก)
      if (newPassword) {
        await axios.put(
          `${API_URL}/auth/profile/update-password`,
          { oldPassword, newPassword },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        // 🧹 ล้างฟิลด์รหัสผ่าน
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      // ✅ แสดง Success Message
      setNotificationType("success");
      setNotification("Profile updated successfully!");

      // 🔄 รีเฟรชหน้าเพื่อโหลดข้อมูลใหม่
      setTimeout(() => {
        window.location.reload();
      }, 1500); // รอ 1.5 วินาทีแล้วค่อย Refresh
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // ❌ แสดง Error Message
      setNotificationType("error");
      
      // 🔍 แสดง Error Message ตามประเภท
      if (error.response?.status === 401) {
        setNotification("Old password is incorrect.");
      } else {
        setNotification("Failed to update profile.");
      }
    }
  };

  /*
  ==============================================================
                    🔄 UI CONTROL FUNCTIONS
  ==============================================================
  📝 Purpose: ฟังก์ชันสำหรับควบคุม UI Components
  ==============================================================
  */
  
  // 📱 Toggle Sidebar สำหรับ Mobile
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // 🚪 Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token"); // 🗑️ ลบ JWT Token
    window.location.href = "/login";  // 🚀 Redirect ไป Login
  };

  /*
  ==============================================================
                    📧 SEND USER ID TO EMAIL
  ==============================================================
  📝 Purpose: ส่ง User ID ไปยังอีเมลของผู้ใช้ (สำหรับตั้งค่า ESP32)
  📥 Input: email, userId
  📤 Output: Success/Error Message
  
  🔄 Use Case:
  - ผู้ใช้ต้องการ User ID เพื่อตั้งค่าใน ESP32 Code
  - ส่งทางอีเมลเพื่อความปลอดภัย
  
  🔐 API Endpoint: POST /auth/send-user-id
  📊 Request Body: { email, userId }
  ==============================================================
  */
  const handleSendUserId = async () => {
    try {
      // 🌐 ส่ง User ID ไปทางอีเมล
      const response = await axios.post(
        `${API_URL}/auth/send-user-id`,
        {
          email: email,   // 📧 อีเมลจาก State
          userId: userId, // 🆔 User ID จาก State
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔐 JWT Token
          },
        }
      );

      if (response.status === 200) {
        // ✅ ส่งสำเร็จ
        setNotificationType("success");
        setNotification("User ID has been sent to your email.");
      }
    } catch (error) {
      console.error("Error sending User ID:", error);
      
      // ❌ ส่งไม่สำเร็จ
      setNotificationType("error");
      setNotification("Failed to send User ID to your email.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      
      {/* 📱 Sidebar Component */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* 📄 Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* 🧭 Navbar Component */}
        <Navbar onLogout={handleLogout} toggleSidebar={toggleSidebar} />

        {/* 👤 Profile Content */}
        <div className="flex-1 flex flex-col items-center mt-8 px-4">
          <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 mb-8 border border-emerald-100">
            
            {/* 📢 Page Title */}
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Profile User
            </h1>

            {/* 🔔 Notification Display */}
            {notification && (
              <div
                className={`px-6 py-4 rounded-xl mb-6 flex items-center space-x-2 ${
                  notificationType === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  {notificationType === "success" ? (
                    // ✅ Success Icon
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    // ❌ Error Icon
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
                <span>{notification}</span>
              </div>
            )}

            {/* 🖼️ Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-6 flex items-center justify-center overflow-hidden shadow-xl border-4 border-white">
                {profilePicture ? (
                  // 🖼️ แสดงรูปโปรไฟล์
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // 👤 แสดง Default Avatar Icon
                  <svg className="w-16 h-16 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* 📸 Choose Picture Button */}
              <label
                htmlFor="profilePicture"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
              >
                Choose Picture
              </label>
              
              {/* 📁 Hidden File Input */}
              <input
                type="file"
                id="profilePicture"
                accept="image/*"              // 🖼️ Accept only image files
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>

            {/* 📋 User Info Form */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              
              {/* 🆔 User ID Section (Hidden Display) */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-700">
                  User ID:
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* 🔒 Hidden User ID Input */}
                  <input
                    type="text"
                    value="********"      // 🫣 แสดงเป็นดอกจันเพื่อความปลอดภัย
                    disabled
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 cursor-not-allowed text-gray-500"
                  />
                  
                  {/* 📧 Send User ID Button */}
                  <button
                    onClick={handleSendUserId}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg whitespace-nowrap"
                  >
                    Send User ID to Email
                  </button>
                </div>
              </div>

              {/* 👤 Name Input */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-700">
                  Name:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* 📧 Email Display (Read-only) */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-700">
                  Email:
                </label>
                <input
                  type="email"
                  value={email}
                  disabled                // 🔒 Read-only
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 cursor-not-allowed text-gray-500"
                />
              </div>
            </div>

            {/* 🔐 Change Password Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-700 flex items-center space-x-2">
                {/* 🔒 Lock Icon */}
                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Change Password</span>
              </h2>

              {/* 📋 Password Change Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 🔑 Old Password */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-semibold">
                    Old Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Enter your current password"
                  />
                </div>

                {/* 🆕 New Password */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-semibold">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Enter your new password"
                  />
                  <p className="text-xs text-gray-500">
                    At least 8 characters with numbers and letters
                  </p>
                </div>

                {/* ✅ Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Confirm your new password"
                  />
                </div>

                {/* 🚀 Update Profile Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

/*
==============================================================
                    📋 COMPONENT DOCUMENTATION
==============================================================

🔧 Props: ไม่มี

📊 State Variables:
├── userId: string                → User ID (ซ่อนจากผู้ใช้)
├── profilePicture: string        → URL รูปโปรไฟล์
├── name: string                  → ชื่อผู้ใช้ (แก้ไขได้)
├── email: string                 → อีเมล (แสดงอย่างเดียว)
├── oldPassword: string           → รหัสผ่านเก่า
├── newPassword: string           → รหัสผ่านใหม่
├── confirmPassword: string       → ยืนยันรหัสผ่าน
├── isSidebarOpen: boolean        → สถานะ Sidebar
├── notification: string          → Notification message
└── notificationType: string      → success/error

🌐 API Calls:
├── GET /auth/user-info           → ดึงข้อมูลผู้ใช้
├── POST /auth/profile/upload-picture → อัปโหลดรูปโปรไฟล์
├── PUT /auth/profile/update-name → อัปเดตชื่อ
├── PUT /auth/profile/update-password → เปลี่ยนรหัสผ่าน
└── POST /auth/send-user-id       → ส่ง User ID ทางอีเมล

🔐 Protected Route Features:
├── JWT Token validation          → ตรวจสอบ Token
├── Auto redirect to login        → หากไม่มี Token
└── Authorization headers         → ส่ง Token ในทุก Request

📸 File Upload Features:
├── Image file validation         → accept="image/*"
├── Preview before upload         → แสดงตัวอย่างทันที
├── FormData for file upload      → multipart/form-data
└── Error handling               → จัดการ Error ในการอัปโหลด

✅ Form Validation:
├── Username: 1-12 characters     → ไม่มีอักขระพิเศษ
├── Password: 8+ chars + numbers  → ต้องมีตัวเลข
├── Password confirmation         → ต้องตรงกัน
└── Real-time validation         → แสดง Error ทันที

🎨 UI Features:
├── Responsive design             → Mobile + Desktop
├── Loading states               → แสดงสถานะโหลด
├── Success/Error notifications  → แสดงผลลัพธ์
├── Profile picture preview      → แสดงตัวอย่างรูป
├── Gradient backgrounds         → ดีไซน์สวยงาม
└── Smooth animations           → Transition effects

🔒 Security Features:
├── Hidden User ID display        → แสดงเป็น ********
├── Email read-only              → ไม่ให้แก้ไข
├── Old password required        → เปลี่ยนรหัสต้องใส่รหัสเก่า
├── Password strength validation  → ตรวจสอบความแข็งแรง
└── JWT token protection         → ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต

📧 ESP32 Integration:
└── Send User ID to email        → สำหรับตั้งค่าใน ESP32 Code

🔄 Auto Features:
├── Data fetch on mount          → โหลดข้อมูลอัตโนมัติ
├── Page refresh after update    → รีเฟรชหลังอัปเดต
└── Clear password fields        → ล้างรหัสผ่านหลังเปลี่ยน

================================================================
*/