/*
==============================================================
                    WLS ESP32 SENSOR DATA READER
==============================================================
📝 Description: ESP32 Arduino Code สำหรับอ่านข้อมูลเซ็นเซอร์ระดับน้ำผ่าน RS485
🎯 Purpose: รับข้อมูลจากเซ็นเซอร์ → แปลงค่า → ส่งไปยัง WLS Backend Server
🔧 Technologies: ESP32 + RS485 + WiFi + HTTP Client + JSON

📂 Hardware Connections:
├── RS485 RX Pin → GPIO 8
├── RS485 TX Pin → GPIO 7
├── WiFi Module → Built-in ESP32
└── Power → 3.3V/5V

📊 Data Flow:
1. เซ็นเซอร์ส่งข้อมูลผ่าน RS485 (5 bytes)
2. ESP32 รับและแปลงข้อมูล
3. แปลง Node ID เป็นชื่อตำแหน่ง
4. สร้าง JSON Object
5. ส่งไปยัง Backend ผ่าน HTTP POST

⚠️  Important Notes:
1. ต้องติดตั้งไลบรารี ArduinoJson ใน Arduino IDE
2. ตั้งค่า WiFi SSID และ Password ให้ถูกต้อง
3. Backend Server ต้องรันอยู่ก่อน
4. User ID ต้องตรงกับฐานข้อมูล
==============================================================
*/

#include <HardwareSerial.h>  // สำหรับ RS485 Communication
#include <WiFi.h>            // สำหรับเชื่อมต่อ WiFi
#include <HTTPClient.h>      // สำหรับส่ง HTTP Request
#include <ArduinoJson.h>     // สำหรับสร้างและแปลง JSON Object

/*
==============================================================
                    🔌 RS485 CONFIGURATION
==============================================================
📝 Purpose: ตั้งค่าการสื่อสารผ่าน RS485 Protocol
🔧 Hardware: RS485 Module เชื่อมต่อกับ ESP32

📊 RS485 Protocol:
- Baud Rate: 9600
- Data Bits: 8
- Parity: None
- Stop Bits: 1
- RX Pin: GPIO 8 (รับข้อมูล)
- TX Pin: GPIO 7 (ส่งข้อมูล)

📦 Data Frame Format (5 bytes):
[0] = 0x3A (Start Byte)
[1] = Node ID ('A', 'B', 'C', 'D')
[2] = Value Low Byte
[3] = Value High Byte
[4] = End Byte
==============================================================
*/

#define RS485_RX_PIN 8  // GPIO 8 สำหรับรับข้อมูล RS485
#define RS485_TX_PIN 7  // GPIO 7 สำหรับส่งข้อมูล RS485
HardwareSerial rs485Serial(1); // ใช้ Serial Port 1 ของ ESP32

/*
==============================================================
                    🌐 WIFI & BACKEND CONFIGURATION
==============================================================
📝 Purpose: ตั้งค่าการเชื่อมต่อ WiFi และ Backend Server

🔧 WiFi Settings:
- SSID: ชื่อ WiFi Network
- Password: รหัsผ่าน WiFi

🌍 Backend API Endpoint:
- URL: http://192.168.2.25:3000/auth/api/sensor-data
- Method: POST
- Content-Type: application/json
- Body: JSON Object with sensor data

⚠️  Configuration Notes:
1. เปลี่ยน SSID และ Password ตามเครือข่ายของคุณ
2. เปลี่ยน IP Address ตาม Backend Server
3. Port 3000 = Default port ของ WLS Backend
==============================================================
*/

const char* ssid = "QW_F1_2.4G";        // 📶 ชื่อ WiFi Network
const char* password = "Qwave@dmin";     // 🔐 รหัสผ่าน WiFi
const String backendURL = "http://192.168.2.25:3000/auth/api/sensor-data"; // 🌐 Backend API Endpoint

/*
==============================================================
                    🏷️ DEVICE IDENTIFICATION
==============================================================
📝 Purpose: กำหนดข้อมูลระบุตัวตนของ ESP32 และผู้ใช้

👤 USER_ID:
- เชื่อมโยงกับ User ในฐานข้อมูล (users.id)
- ต้องตรงกับ ID ในตาราง users
- ใช้สำหรับแยกข้อมูลของแต่ละผู้ใช้

🔢 ESP32_SERIAL_NUMBER:
- หมายเลขเฉพาะของ ESP32 แต่ละตัว
- ใช้แยกข้อมูลจาก ESP32 หลายตัวของผู้ใช้คนเดียว
- ช่วยในการ Debug และ Monitor

🎯 SENSOR_TYPE:
- ประเภทเซ็นเซอร์ที่ใช้ (WaterLevel, Temperature, etc.)
- ใช้สำหรับ Filter และ Analyze ข้อมูล
==============================================================
*/

const String USER_ID = "38";              // 👤 User ID ในฐานข้อมูล (เปลี่ยนตามผู้ใช้จริง)
const String ESP32_SERIAL_NUMBER = "1";   // 🔢 Serial Number เฉพาะของ ESP32 ตัวนี้
const String SENSOR_TYPE = "WaterLevel";  // 🌊 ประเภทเซ็นเซอร์ระดับน้ำ

/*
==============================================================
                    📦 DATA BUFFER MANAGEMENT
==============================================================
📝 Purpose: จัดการ Buffer สำหรับรับข้อมูลจาก RS485

💾 Buffer Array:
- ขนาด 10 bytes (เผื่อไว้ในกรณีข้อมูลเกิน)
- ใช้เก็บข้อมูลที่รับจาก RS485 ชั่วคราว

📊 Buffer Index:
- ตัวชี้ตำแหน่งปัจจุบันใน Buffer
- รีเซ็ตเป็น 0 หลังอ่านข้อมูลครบ 5 bytes
==============================================================
*/

uint8_t buffer[10];        // 📦 Buffer สำหรับเก็บข้อมูล RS485
uint8_t bufferIndex = 0;   // 📍 Index ตำแหน่งปัจจุบันใน Buffer

/*
==============================================================
                    🚀 SETUP FUNCTION
==============================================================
📝 Purpose: ฟังก์ชันเริ่มต้นที่รันครั้งเดียวตอน Power On

🔧 Initialization Process:
1. เริ่มต้น Serial Communication (Debug)
2. เริ่มต้น RS485 Communication
3. เชื่อมต่อ WiFi Network
4. แสดงข้อมูลการตั้งค่า

⏱️  Connection Timeout:
- รอการเชื่อมต่อ WiFi แบบไม่จำกัดเวลา
- แสดง "." ทุกๆ 500ms จนกว่าจะเชื่อมต่อสำเร็จ
==============================================================
*/

void setup() {
  // 🔧 เริ่มต้น Serial Communication สำหรับ Debug
  Serial.begin(115200);  // ความเร็ว 115200 baud
  
  // 📡 เริ่มต้น RS485 Communication
  rs485Serial.begin(9600, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN);
  
  // 🌐 เชื่อมต่อ WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  // ⏳ รอการเชื่อมต่อ WiFi
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");  // แสดง Progress
  }
  
  // ✅ แสดงข้อมูลการเชื่อมต่อสำเร็จ
  Serial.println("\n✅ WiFi Connected. IP: " + WiFi.localIP().toString());
  Serial.println("📡 กำลังรับข้อมูล RS485...");
  Serial.println("👤 User ID: " + USER_ID);
  Serial.println("🔢 ESP32 Serial: " + ESP32_SERIAL_NUMBER);
  Serial.println("🌊 Sensor Type: " + SENSOR_TYPE);
  Serial.println("🌐 Backend URL: " + backendURL);
  Serial.println("====================================");
}

/*
==============================================================
                    🏷️ NODE ID TO NAME CONVERTER
==============================================================
📝 Purpose: แปลง Node ID (ตัวอักษร) เป็นชื่อตำแหน่งที่เข้าใจง่าย

📊 Node Mapping:
- 'A' → "Qwave"     (สำนักงานหลัก)
- 'B' → "Factory"   (โรงงาน)
- 'C' → "Warehouse" (คลังสินค้า)
- 'D' → "Lab"       (ห้องแล็บ)
- อื่นๆ → "Unknown"  (กรณีไม่รู้จัก)

🎯 Benefits:
- ข้อมูลใน Database เป็นชื่อที่เข้าใจง่าย
- Frontend แสดงผลได้สวยงาม
- ง่ายต่อการ Debug และ Monitor

⚠️  Adding New Nodes:
เมื่อเพิ่ม Node ใหม่ ให้เพิ่ม case ใหม่ในฟังก์ชันนี้
==============================================================
*/

String getNodeName(char nodeChar) {
  switch (nodeChar) {
    case 'A': return "Qwave";      // 🏢 สำนักงานหลัก
    case 'B': return "Factory";    // 🏭 โรงงาน
    case 'C': return "Warehouse";  // 📦 คลังสินค้า
    case 'D': return "Lab";        // 🔬 ห้องแล็บ
    default:  return "Unknown";    // ❓ ไม่ทราบตำแหน่ง
  }
}

/*
==============================================================
                    🔄 MAIN LOOP FUNCTION
==============================================================
📝 Purpose: ฟังก์ชันหลักที่รันซ้ำๆ ตลอดเวลา

🔄 Process Flow:
1. ตรวจสอบว่ามีข้อมูลใน RS485 Buffer หรือไม่
2. อ่านข้อมูลทีละ Byte
3. เก็บใน Buffer จนครบ 5 bytes
4. ตรวจสอบ Start Byte (0x3A)
5. แปลง Node ID เป็นชื่อตำแหน่ง
6. คำนวณค่าเซ็นเซอร์จาก 2 bytes (Little Endian)
7. ส่งข้อมูลไปยัง Backend
8. รีเซ็ต Buffer และเริ่มรอบใหม่

📊 Data Parsing:
- buffer[0] = Start Byte (0x3A)
- buffer[1] = Node ID ('A', 'B', 'C', 'D')
- buffer[2] = Value Low Byte
- buffer[3] = Value High Byte
- buffer[4] = End Byte

💡 Value Calculation:
value = (buffer[3] << 8) | buffer[2]  // Little Endian format
==============================================================
*/

void loop() {
  // 📡 ตรวจสอบว่ามีข้อมูลใน RS485 หรือไม่
  while (rs485Serial.available()) {
    // 📥 อ่านข้อมูลทีละ byte
    byte b = rs485Serial.read();
    
    // 📦 เก็บข้อมูลใน Buffer (ป้องกัน Buffer Overflow)
    if (bufferIndex < sizeof(buffer)) {
      buffer[bufferIndex++] = b;
    }
    
    // ✅ ตรวจสอบว่าได้รับข้อมูลครบ 5 bytes แล้วหรือยัง
    if (bufferIndex == 5) {
      
      // 🔍 ตรวจสอบ Start Byte
      if (buffer[0] == 0x3A) {
        
        // 📊 แปลงข้อมูล
        char nodeChar = (char)buffer[1]; // Node ID
        uint16_t value = ((uint16_t)buffer[3] << 8) | buffer[2]; // ค่าเซ็นเซอร์ (Little Endian)
        String nodeName = getNodeName(nodeChar); // แปลงเป็นชื่อตำแหน่ง
        
        // 🖥️ แสดงข้อมูลใน Serial Monitor
        Serial.print("📥 Node ");
        Serial.print(nodeChar);
        Serial.print(" (");
        Serial.print(nodeName);
        Serial.print(") → ค่า: ");
        Serial.print(value);
        Serial.println(" (Raw Data: " + 
                      String(buffer[0], HEX) + " " +
                      String(buffer[1], HEX) + " " +
                      String(buffer[2], HEX) + " " +
                      String(buffer[3], HEX) + " " +
                      String(buffer[4], HEX) + ")");
        
        // 🌐 ส่งข้อมูลไป Backend
        sendSensorData(USER_ID, ESP32_SERIAL_NUMBER, nodeName, SENSOR_TYPE, value);
        
      } else {
        // ❌ Start Byte ไม่ถูกต้อง
        Serial.println("⚠️ ไม่พบ start byte 0x3A หรือข้อมูลไม่ถูกต้อง");
        Serial.print("📦 Received: ");
        for (int i = 0; i < 5; i++) {
          Serial.print(String(buffer[i], HEX) + " ");
        }
        Serial.println();
      }
      
      // 🔄 รีเซ็ต Buffer สำหรับรอบถัดไป
      bufferIndex = 0;
    }
  }
}

/*
==============================================================
                    🌐 SEND DATA TO BACKEND FUNCTION
==============================================================
📝 Purpose: ส่งข้อมูลเซ็นเซอร์ไปยัง WLS Backend Server

📥 Parameters:
- userId: User ID ในฐานข้อมูล
- esp32Serial: Serial Number ของ ESP32
- nodeName: ชื่อตำแหน่งของเซ็นเซอร์
- sensorType: ประเภทเซ็นเซอร์
- value: ค่าที่อ่านได้จากเซ็นเซอร์

📊 JSON Structure:
{
  "userId": "38",
  "esp32Serial": "1",
  "nodeName": "Qwave",
  "sensorType": "WaterLevel",
  "value": 1024
}

🌐 HTTP Request:
- Method: POST
- Content-Type: application/json
- Endpoint: /auth/api/sensor-data

✅ Success Response: HTTP 201
❌ Error Response: HTTP 4xx/5xx

⚠️  Error Handling:
1. ตรวจสอบการเชื่อมต่อ WiFi ก่อนส่ง
2. แสดง HTTP Status Code
3. แสดง Error Message หากส่งไม่สำเร็จ
==============================================================
*/

void sendSensorData(String userId, String esp32Serial, String nodeName, String sensorType, uint16_t value) {
  // 🔍 ตรวจสอบสถานะ WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⛔ WiFi Disconnected. Cannot send data.");
    Serial.println("🔄 Attempting to reconnect...");
    WiFi.begin(ssid, password);
    return;
  }
  
  // 🌐 เริ่มต้น HTTP Client
  HTTPClient http;
  http.begin(backendURL);
  http.addHeader("Content-Type", "application/json");
  
  // 📦 สร้าง JSON Object
  StaticJsonDocument<300> doc;
  doc["userId"] = userId;           // 👤 User ID
  doc["esp32Serial"] = esp32Serial; // 🔢 ESP32 Serial Number
  doc["nodeName"] = nodeName;       // 📍 ตำแหน่งเซ็นเซอร์
  doc["sensorType"] = sensorType;   // 🌊 ประเภทเซ็นเซอร์
  doc["value"] = value;             // 📊 ค่าเซ็นเซอร์
  
  // 📝 แปลง JSON Object เป็น String
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  // 🖥️ แสดงข้อมูลที่ส่ง
  Serial.println("🌐 กำลังส่งข้อมูล JSON ไปยัง Backend:");
  Serial.println("📄 " + jsonPayload);
  Serial.println("🎯 URL: " + backendURL);
  
  // 📤 ส่ง HTTP POST Request
  int httpCode = http.POST(jsonPayload);
  String response = http.getString();
  
  // 📊 ตรวจสอบผลลัพธ์
  if (httpCode == 201) {
    Serial.println("✅ ส่งข้อมูลสำเร็จ! HTTP Code: " + String(httpCode));
    Serial.println("📋 Response: " + response);
  } else {
    Serial.println("❌ เกิดข้อผิดพลาด! HTTP Code: " + String(httpCode));
    Serial.println("📄 Error Response: " + response);
    Serial.println("🔧 กรุณาตรวจสอบ Backend Server และ Network Connection");
  }
  
  // 🔚 ปิด HTTP Connection
  http.end();
  
  // ⏱️ หน่วงเวลาป้องกันการส่งข้อมูลถี่เกินไป
  delay(1000);
}

/*
==============================================================
                    📋 ARDUINO IDE SETUP GUIDE
==============================================================

🚀 Required Libraries:
1. ArduinoJson by Benoit Blanchon
   - Tools → Manage Libraries → Search "ArduinoJson" → Install

📱 Board Configuration:
1. Board: ESP32 Dev Module
2. CPU Frequency: 240MHz (WiFi/BT)
3. Flash Frequency: 80MHz
4. Flash Mode: DIO
5. Flash Size: 4MB (32Mb)
6. Partition Scheme: Default 4MB with spiffs
7. Core Debug Level: None

🔌 Hardware Connections:
ESP32 Pin    →    RS485 Module
---------------------------------
GPIO 8       →    RX (Data Input)
GPIO 7       →    TX (Data Output)
3.3V         →    VCC
GND          →    GND

📊 RS485 Sensor Output Format:
Byte 0: 0x3A (Start Byte)
Byte 1: Node ID ('A', 'B', 'C', 'D')
Byte 2: Value Low Byte
Byte 3: Value High Byte
Byte 4: End Byte

🌐 Network Requirements:
- WiFi Network with Internet Access
- Backend Server running on specified IP:Port
- Firewall allow HTTP traffic on port 3000

🐛 Troubleshooting:
1. "WiFi Connection Failed" → Check SSID/Password
2. "HTTP Error 500" → Check Backend Server Status
3. "No RS485 Data" → Check Hardware Connections
4. "JSON Parse Error" → Check ArduinoJson Library

📈 Monitoring:
- Open Serial Monitor (Tools → Serial Monitor)
- Set Baud Rate to 115200
- Watch for sensor data and HTTP responses
- Check Backend Server logs for received data

⚠️  Production Notes:
1. Change WiFi credentials for production network
2. Update Backend URL to production server
3. Set appropriate USER_ID for each ESP32
4. Add error recovery and watchdog timer
5. Implement OTA (Over-The-Air) updates
==============================================================
*/