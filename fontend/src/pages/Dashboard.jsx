/*
==============================================================
                    WLS SENSOR DATA DASHBOARD
==============================================================
📝 Description: หน้าแดshบอร์ดหลักสำหรับแสดงข้อมูลเซ็นเซอร์ WLS (Water Level Sensor)
🎯 Purpose: แสดงข้อมูลเซ็นเซอร์แบบ Real-time → กราฟและชาร์ต → กรองข้อมูล
🔧 Technologies: React + Recharts + React D3 Speedometer + Axios + Protected Route

📊 Dashboard Features:
├── Real-time Data Fetching (ทุก 10 วินาที)
├── Interactive Charts (Line, Bar, Speedometer)
├── Data Filtering (Node, Time Range)
├── Responsive Design (Mobile + Desktop)
└── Live Data Updates

📈 Chart Types:
├── Speedometer → ค่าปัจจุบัน
├── Line Chart → ข้อมูล Real-time
├── Bar Chart → Average รายวัน
└── Min/Max Chart → ค่าสูงสุด/ต่ำสุดรายวัน

🔐 Protected Route:
- ต้องมี JWT Token ใน localStorage
- Auto redirect ไป /login หากไม่มี Token
- Authorization header ในทุก API call

🌐 API Integration:
- GET /auth/sensor-data → ดึงข้อมูลเซ็นเซอร์ทั้งหมด
==============================================================
*/

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import ReactSpeedometer from "react-d3-speedometer";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { API_URL } from "../config";

const Dashboard = () => {
  // 📊 State Management
  const [sensorData, setSensorData] = useState([]);         // ข้อมูลเซ็นเซอร์ทั้งหมด
  const [nodeNames, setNodeNames] = useState([]);           // รายชื่อ Node ที่มี
  const [selectedNode, setSelectedNode] = useState("");     // Node ที่เลือกแสดง
  const [latestValue, setLatestValue] = useState(0);        // ค่าล่าสุดสำหรับ Speedometer
  const [timeRange, setTimeRange] = useState(10);           // ช่วงเวลาที่แสดง (นาที)
  const [isLoggedIn, setIsLoggedIn] = useState(false);      // สถานะการ Login
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // สถานะ Sidebar
  const navigate = useNavigate();

  /*
  ==============================================================
                    📡 REAL-TIME DATA FETCHING
  ==============================================================
  📝 Purpose: ดึงข้อมูลเซ็นเซอร์จาก Backend แบบ Real-time
  📥 Input: JWT Token จาก localStorage
  📤 Output: Sensor data array
  
  🔄 Process Flow:
  1. ตรวจสอบ JWT Token
  2. หากไม่มี Token → Redirect ไป /login
  3. ส่ง GET Request พร้อม Authorization Header
  4. อัปเดต sensorData state
  5. สร้างรายชื่อ Node ที่ไม่ซ้ำ
  6. ตั้งค่า selectedNode เป็น Node แรก (หากยังไม่เลือก)
  
  ⏱️ Auto Refresh:
  - ทุกๆ 10 วินาที (setInterval)
  - Auto cleanup เมื่อ Component unmount
  
  🔐 API Endpoint: GET /auth/sensor-data
  📋 Response: Array of sensor data objects
  
  ⚠️ Error Handling:
  - Console log error (ควรปรับปรุงให้แสดง UI error)
  ==============================================================
  */
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        // 🔍 ตรวจสอบ JWT Token
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login"); // 🚀 Redirect หากไม่มี Token
          return;
        }

        setIsLoggedIn(true); // ✅ ตั้งสถานะ Login

        // 🌐 เรียก API เพื่อดึงข้อมูลเซ็นเซอร์
        const response = await axios.get(
          `${API_URL}/auth/sensor-data`, // 🔗 API Endpoint
          {
            headers: {
              Authorization: `Bearer ${token}`, // 🔐 ส่ง JWT Token
            },
          }
        );

        setSensorData(response.data); // 📊 อัปเดตข้อมูลเซ็นเซอร์

        // 🏷️ สร้างรายชื่อ Node ที่ไม่ซ้ำ
        const nodes = [...new Set(response.data.map((data) => data.node_name))];
        setNodeNames(nodes);

        // 🎯 ตั้งค่า selectedNode เฉพาะเมื่อยังไม่มีค่า
        if (!selectedNode && nodes.length > 0) {
          setSelectedNode(nodes[0]); // เลือก Node แรกเป็นค่าเริ่มต้น
        }
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        // TODO: แสดง Error Message ใน UI
      }
    };

    fetchSensorData(); // 🚀 เรียกครั้งแรกทันที

    // ⏰ ตั้ง Auto Refresh ทุกๆ 10 วินาที
    const interval = setInterval(fetchSensorData, 10000);
    
    // 🧹 Cleanup function
    return () => clearInterval(interval);
  }, [navigate, selectedNode]); // Dependencies

  /*
  ==============================================================
                    🔍 DATA FILTERING LOGIC
  ==============================================================
  📝 Purpose: กรองข้อมูลตาม Node และ Time Range ที่เลือก
  📥 Input: sensorData, selectedNode, timeRange
  📤 Output: filteredData (ข้อมูลที่กรองแล้ว)
  
  🔄 Filtering Process:
  1. กรองตาม selectedNode
  2. กรองตาม timeRange (จากปัจจุบันย้อนหลัง)
  3. เรียงลำดับจากล่าสุดไปเก่าสุด
  
  ⏱️ Time Range Options:
  - 1, 5, 10, 15, 30 นาที
  - คำนวณจาก currentTime - (timeRange * 60 * 1000)
  
  📊 Data Structure:
  - timestamp: วันเวลาของข้อมูล
  - node_name: ชื่อ Node/ตำแหน่ง
  - sensor_value: ค่าเซ็นเซอร์
  ==============================================================
  */
  const filteredData = sensorData
    .filter((data) => {
      const dataTime = new Date(data.timestamp).getTime(); // 📅 แปลงเป็น milliseconds
      const currentTime = Date.now();                       // ⏰ เวลาปัจจุบัน
      
      return (
        data.node_name === selectedNode && // 🏷️ กรองตาม Node ที่เลือก
        dataTime >= currentTime - timeRange * 60 * 1000 // ⏱️ กรองตามช่วงเวลา
      );
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // 📈 เรียงจากล่าสุดไปเก่าสุด

  /*
  ==============================================================
                    📊 LATEST VALUE UPDATE
  ==============================================================
  📝 Purpose: อัปเดตค่าล่าสุดสำหรับ Speedometer
  📥 Input: filteredData
  📤 Output: latestValue state
  
  🔄 Logic:
  - หากมีข้อมูลใน filteredData → ใช้ข้อมูลตัวแรก (ล่าสุด)
  - หากไม่มีข้อมูล → ตั้งค่าเป็น 0
  
  ⚡ Trigger: ทุกครั้งที่ filteredData เปลี่ยน
  ==============================================================
  */
  useEffect(() => {
    if (filteredData.length > 0) {
      // ✅ มีข้อมูล → ใช้ข้อมูลล่าสุด
      const latestData = filteredData[0];
      setLatestValue(latestData.sensor_value);
    } else {
      // ❌ ไม่มีข้อมูล → ตั้งค่าเป็น 0
      setLatestValue(0);
    }
  }, [filteredData]); // Dependency: filteredData

  /*
  ==============================================================
                    🎛️ EVENT HANDLERS
  ==============================================================
  📝 Purpose: ฟังก์ชันจัดการ Events ต่างๆ
  ==============================================================
  */

  // 🏷️ Node Selection Handler
  const handleNodeChange = (event) => {
    setSelectedNode(event.target.value);
  };

  // 🚪 Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token"); // 🗑️ ลบ JWT Token
    setIsLoggedIn(false);             // ❌ อัปเดตสถานะ
    navigate("/login");               // 🚀 Redirect ไป Login
  };

  // 📱 Sidebar Toggle Handler
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  /*
  ==============================================================
                    🕐 TIME FORMATTING UTILITY
  ==============================================================
  📝 Purpose: แปลง timestamp เป็น format ที่อ่านง่าย
  📥 Input: timestamp (ISO string หรือ Date object)
  📤 Output: formatted time string
  
  🌏 Timezone: Asia/Bangkok (GMT+7)
  📊 Format: HH:MM:SS AM/PM
  
  🎯 Use Cases:
  - X-axis labels ใน Charts
  - Tooltip displays
  - Time display ใน UI
  ==============================================================
  */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { 
      timeZone: "Asia/Bangkok" // 🇹🇭 ใช้เวลาประเทศไทย
    });
  };

  /*
  ==============================================================
                    📈 DAILY AVERAGE CALCULATION
  ==============================================================
  📝 Purpose: คำนวณค่าเฉลี่ยรายวันสำหรับ Bar Chart
  📥 Input: sensorData array
  📤 Output: Array of { date, average }
  
  🔄 Process:
  1. กรองข้อมูลตาม selectedNode
  2. จัดกลุ่มตามวันที่
  3. คำนวณค่าเฉลี่ยแต่ละวัน
  4. Return array สำหรับ Chart
  
  📅 Date Format: MM/DD/YYYY (US format)
  🌏 Timezone: Asia/Bangkok
  
  ⚡ Performance: ทำการคำนวณใหม่ทุกครั้งที่ render
  (ควรใช้ useMemo เพื่อ optimize)
  ==============================================================
  */
  const calculateDailyAverage = (data) => {
    // 🏷️ กรองข้อมูลตาม selectedNode
    const filteredData = data.filter((item) => item.node_name === selectedNode);
    const groupedData = {};

    // 📊 จัดกลุ่มข้อมูลตามวันที่
    filteredData.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString("en-US", {
        timeZone: "Asia/Bangkok", // 🇹🇭 เวลาประเทศไทย
      });

      if (!groupedData[date]) {
        groupedData[date] = { total: 0, count: 0 };
      }

      groupedData[date].total += item.sensor_value; // 📈 รวมค่า
      groupedData[date].count += 1;                 // 🔢 นับจำนวน
    });

    // 📊 คำนวณค่าเฉลี่ยและ return array
    return Object.keys(groupedData).map((date) => ({
      date,
      average: groupedData[date].total / groupedData[date].count, // 📈 ค่าเฉลี่ย
    }));
  };

  /*
  ==============================================================
                    📊 DAILY MIN/MAX CALCULATION
  ==============================================================
  📝 Purpose: คำนวณค่าสูงสุดและต่ำสุดรายวันสำหรับ Bar Chart
  📥 Input: sensorData array
  📤 Output: Array of { date, min, max }
  
  🔄 Process:
  1. กรองข้อมูลตาม selectedNode
  2. จัดกลุ่มตามวันที่
  3. หาค่า Min และ Max แต่ละวัน
  4. Return array สำหรับ Chart
  
  📅 Date Format: MM/DD/YYYY (US format)
  🌏 Timezone: Asia/Bangkok
  
  ⚡ Performance: ทำการคำนวณใหม่ทุกครั้งที่ render
  (ควรใช้ useMemo เพื่อ optimize)
  ==============================================================
  */
  const calculateDailyMinMax = (data) => {
    // 🏷️ กรองข้อมูลตาม selectedNode
    const filteredData = data.filter((item) => item.node_name === selectedNode);
    const groupedData = {};

    // 📊 จัดกลุ่มข้อมูลและหาค่า Min/Max
    filteredData.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString("en-US", {
        timeZone: "Asia/Bangkok", // 🇹🇭 เวลาประเทศไทย
      });

      if (!groupedData[date]) {
        // 🆕 วันที่ใหม่ → ตั้งค่าเริ่มต้น
        groupedData[date] = { 
          min: item.sensor_value, 
          max: item.sensor_value 
        };
      } else {
        // 📊 อัปเดตค่า Min และ Max
        groupedData[date].min = Math.min(groupedData[date].min, item.sensor_value);
        groupedData[date].max = Math.max(groupedData[date].max, item.sensor_value);
      }
    });

    // 📊 Return array สำหรับ Chart
    return Object.keys(groupedData).map((date) => ({
      date,
      min: groupedData[date].min, // 📉 ค่าต่ำสุด
      max: groupedData[date].max, // 📈 ค่าสูงสุด
    }));
  };

  // 📊 คำนวณข้อมูลสำหรับ Charts
  const dailyAverageData = calculateDailyAverage(sensorData);
  const dailyMinMaxData = calculateDailyMinMax(sensorData);

  /*
  ==============================================================
                    ⚠️ LEGACY CODE - UNUSED
  ==============================================================
  📝 Note: Function นี้ดูเหมือนเหลือจากการ copy-paste
  🚫 Status: ไม่ได้ใช้งาน (ควรลบออก)
  ==============================================================
  */
  const handleSubmit = async (e) => {
    const response = await axios.post(
      "http://192.168.1.103:3000/auth/login", // ⚠️ Hardcoded URL
      values
    );
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
      <div
        className={`flex-1 flex flex-col transition-all duration-300 bg-transparent`}
        style={{ zIndex: 10 }}
      >
        {/* 🧭 Navbar Component */}
        <Navbar onLogout={handleLogout} toggleSidebar={toggleSidebar} />

        {/* 📊 Dashboard Content */}
        <div className="flex flex-col items-center mt-8 px-4">
          
          {/* 📋 Header Card */}
          <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 mb-8 border border-emerald-100">
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Sensor Data Dashboard
            </h1>

            {/* 🎛️ Controls Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* 🏷️ Node Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label
                  htmlFor="node-select"
                  className="text-lg font-semibold text-gray-700 whitespace-nowrap"
                >
                  Select Node:
                </label>
                <select
                  id="node-select"
                  value={selectedNode}
                  onChange={handleNodeChange}
                  className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                >
                  {nodeNames.map((node, index) => (
                    <option key={index} value={node}>
                      {node}
                    </option>
                  ))}
                </select>
              </div>

              {/* ⏱️ Time Range Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label
                  htmlFor="time-range"
                  className="text-lg font-semibold text-gray-700 whitespace-nowrap"
                >
                  Time Range:
                </label>
                <select
                  id="time-range"
                  value={timeRange}
                  onChange={(e) => setTimeRange(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                >
                  <option value={1}>1 Minute</option>
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* 📊 Charts Grid */}
          <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            
            {/* ⚡ Left Column - Speedometer Gauge */}
            <div className="xl:col-span-1">
              <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-emerald-100 h-full flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
                  Current Value
                </h2>
                <div className="flex justify-center">
                  {/* 🌀 React D3 Speedometer */}
                  <ReactSpeedometer
                    minValue={0}                    // 📉 ค่าต่ำสุด
                    maxValue={10000}                // 📈 ค่าสูงสุด
                    value={latestValue}             // 📊 ค่าปัจจุบัน
                    needleColor="#374151"           // 🪡 สีเข็ม
                    startColor="#10b981"            // 🟢 สีเริ่มต้น (เขียว)
                    textColor="#374151"             // 📝 สีข้อความ
                    segments={10}                   // 📊 จำนวนส่วน
                    endColor="#ef4444"              // 🔴 สีสิ้นสุด (แดง)
                    valueTextFontWeight="bold"      // 🔤 น้ำหนักตัวอักษร
                    valueTextFontSize="20px"        // 📏 ขนาดตัวอักษร
                    currentValueText={`${latestValue} mm`} // 📊 ข้อความแสดงค่า
                    width={280}                     // 📐 ความกว้าง
                    height={200}                    // 📏 ความสูง
                  />
                </div>
              </div>
            </div>

            {/* 📊 Right Column - Daily Charts */}
            <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 📈 Daily Average Bar Chart */}
              <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-emerald-100">
                <h2 className="text-xl font-bold mb-4 text-center text-gray-700">
                  Daily Average
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyAverageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10000]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #10b981",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="average"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]} // 📊 มุมโค้ง
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 📊 Daily Min/Max Bar Chart */}
              <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-emerald-100">
                <h2 className="text-xl font-bold mb-4 text-center text-gray-700">
                  Daily Min/Max
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyMinMaxData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10000]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #10b981",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="min"
                      fill="#34d399"         // 🟢 สีเขียวอ่อน (Min)
                      name="Min Value"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="max"
                      fill="#059669"         // 🟢 สีเขียวเข้ม (Max)
                      name="Max Value"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 📈 Line Chart - Full Width */}
          <div className="w-full max-w-7xl bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-emerald-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
              Real-time Sensor Data
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData}>
                <CartesianGrid stroke="#d1fae5" strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(tick) => formatTimestamp(tick)} // 🕐 แปลงเวลา
                  reversed                                        // 🔄 กลับลำดับ (ล่าสุดซ้าย)
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 10000]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #10b981",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(label) => `Time: ${formatTimestamp(label)}`} // 🕐 แสดงเวลาใน Tooltip
                />
                <Line
                  type="monotone"                 // 📈 เส้นโค้งเรียบ
                  dataKey="sensor_value"         // 📊 ข้อมูลที่แสดง
                  stroke="#059669"               // 🟢 สีเส้น
                  strokeWidth={3}                // 📏 ความหนาเส้น
                  activeDot={{ r: 6, fill: "#10b981" }} // 🔵 จุดเมื่อ hover
                  dot={{ fill: "#10b981", r: 4 }} // 🔵 จุดข้อมูล
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

/*
==============================================================
                    📋 COMPONENT DOCUMENTATION
==============================================================

🔧 Props: ไม่มี

📊 State Variables:
├── sensorData: Array          → ข้อมูลเซ็นเซอร์ทั้งหมด
├── nodeNames: Array           → รายชื่อ Node ที่มี
├── selectedNode: string       → Node ที่เลือกแสดง
├── latestValue: number        → ค่าล่าสุดสำหรับ Speedometer
├── timeRange: number          → ช่วงเวลาที่แสดง (นาที)
├── isLoggedIn: boolean        → สถานะการ Login
└── isSidebarOpen: boolean     → สถานะ Sidebar

🌐 API Calls:
└── GET /auth/sensor-data      → ดึงข้อมูลเซ็นเซอร์

🔐 Protected Route Features:
├── JWT Token validation       → ตรวจสอบ Token
├── Auto redirect to login     → หากไม่มี Token
└── Authorization headers      → ส่ง Token ในทุก Request

📈 Charts & Visualizations:
├── ReactSpeedometer          → Gauge สำหรับค่าปัจจุบัน
├── Recharts LineChart        → กราฟเส้นแบบ Real-time
├── Recharts BarChart         → กราฟแท่งรายวัน (Average)
└── Recharts BarChart         → กราฟแท่งรายวัน (Min/Max)

⏱️ Real-time Features:
├── Auto refresh every 10s    → อัปเดตข้อมูลอัตโนมัติ
├── Live data filtering       → กรองข้อมูลแบบ Real-time
└── Latest value updates      → อัปเดตค่าปัจจุบันใน Speedometer

🎛️ Interactive Features:
├── Node selection            → เลือก Node ที่ต้องการดู
├── Time range filtering      → เลือกช่วงเวลาที่แสดง
├── Responsive charts         → Charts ปรับขนาดตามหน้าจอ
└── Tooltip interactions      → แสดงรายละเอียดเมื่อ hover

📱 Responsive Design:
├── Mobile-first approach     → ออกแบบสำหรับมือถือก่อน
├── Grid layouts             → ใช้ CSS Grid สำหรับ layout
├── Flexible components      → Component ปรับขนาดได้
└── Touch-friendly UI        → UI ที่ใช้งานง่ายบนมือถือ

🔄 Data Processing:
├── Node filtering           → กรองข้อมูลตาม Node
├── Time range filtering     → กรองข้อมูลตามเวลา
├── Daily aggregation        → รวมข้อมูลรายวัน
├── Statistics calculation   → คำนวณค่าเฉลี่ย Min/Max
└── Real-time sorting        → เรียงข้อมูลตามเวลา

⚡ Performance Considerations:
├── useEffect dependencies   → จัดการ Dependencies ให้ถูกต้อง
├── Interval cleanup        → ล้าง setInterval เมื่อ unmount
├── Memoization needed      → ควรใช้ useMemo สำหรับ calculations
└── Large dataset handling  → จัดการข้อมูลจำนวนมาก

🐛 Error Handling:
├── Token validation        → ตรวจสอบ JWT Token
├── API error handling     → จัดการ Error จาก API
├── Empty data states      → จัดการกรณีไม่มีข้อมูล
└── Network error recovery → กู้คืนจาก Network Error

🔮 Future Improvements:
├── WebSocket integration   → Real-time updates ผ่าน WebSocket
├── Data export features   → Export ข้อมูลเป็น CSV/PDF
├── Alert notifications    → แจ้งเตือนเมื่อค่าผิดปกติ
├── Data caching          → Cache ข้อมูลเพื่อ Performance
├── Advanced filtering    → Filter แบบซับซ้อนมากขึ้น
├── Chart customization   → ปรับแต่ง Chart ได้มากขึ้น
└── Performance monitoring → ติดตาม Performance ของแอป

⚠️ Known Issues:
├── Hardcoded API URL      → มี URL ที่ hardcode ใน handleSubmit
├── No error UI           → ไม่มี UI แสดง Error
├── No loading states     → ไม่มี Loading indicators
└── Memory optimization   → ควร optimize การใช้ memory
==============================================================
*/
