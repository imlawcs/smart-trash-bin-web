#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Servo.h>

// WiFi
const char* ssid = "Vsmax";
const char* password = "08042004";

// Server Flask (điều khiển servo)
const char* resultServerUrl = "http://192.168.234.171:8000/get-result";
const char* logServerUrl    = "http://192.168.234.171:8000/log";

// Server NodeJS (cập nhật trạng thái thùng rác)
const char* binStatusServer = "http://192.168.234.171:5000/api/sensor";

// Thùng rác (tín hiệu từ Arduino gửi đến các chân này)
#define BIN1_PIN D1  // metal - GPIO5
#define BIN2_PIN D2  // paper - GPIO4
#define BIN3_PIN D3  // plastic - GPIO0
#define BIN4_PIN D4  // trash - GPIO2

// Servo
#define SERVO1_PIN D5
#define SERVO2_PIN D6
#define SERVO3_PIN D7
#define SERVO4_PIN D8

Servo servo1, servo2, servo3, servo4;

// Trạng thái thùng rác trước đó
bool lastBinState[4] = {false, false, false, false};

// ID cố định và thông tin cảm biến
String binId = "67fe9d8e5b88e664fce895f2";
String compartmentType[4] = {"metal", "paper", "plastic", "trash"};
String sensorId[4] = {
  "esp8266-metal", "esp8266-paper", "esp8266-plastic", "esp8266-trash"
};

void sendLog(String message) {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, logServerUrl);
  http.addHeader("Content-Type", "application/json");

  // Thoát ký tự đặc biệt
  message.replace("\"", "\\\"");
  String jsonPayload = "{\"log\": \"" + message + "\"}";
  http.POST(jsonPayload);
  http.end();
}

// Gửi trạng thái thùng rác lên NodeJS
void sendBinStatus(int binIndex, bool isFull) {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, binStatusServer);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"isFull\":" + String(isFull ? "true" : "false") + ",";
  payload += "\"binId\":\"" + binId + "\",";
  payload += "\"compartmentType\":\"" + compartmentType[binIndex] + "\",";
  payload += "\"sensorId\":\"" + sensorId[binIndex] + "\"";
  payload += "}";

  int response = http.POST(payload);
  if (response > 0) {
    Serial.println("📤 Đã gửi trạng thái " + compartmentType[binIndex] + ": " + (isFull ? "FULL" : "EMPTY"));
    Serial.println("📥 Phản hồi: " + http.getString());
    sendLog("📤 Đã gửi trạng thái " + compartmentType[binIndex] + ": " + (isFull ? "FULL" : "EMPTY"));
    sendLog("📥 Phản hồi: " + http.getString());
  } else {
    Serial.println("❌ Gửi trạng thái thất bại: " + compartmentType[binIndex]);
    sendLog("❌ Gửi trạng thái thất bại: " + compartmentType[binIndex]);
  }
  http.end();
}

// Mở servo theo yêu cầu từ Flask server
// 🔄 Mở từng servo theo góc khác nhau
void openServo(Servo &servo, String name) {
  sendLog("🛠️ Mở " + name);

  if (name == "Servo 1") {
    servo.writeMicroseconds(1200);
    delay(2000);
    servo.writeMicroseconds(1650);
  } else if (name == "Servo 2") {
    servo.writeMicroseconds(1300);
    delay(2000);
    servo.writeMicroseconds(2000);
  } else if (name == "Servo 3") {
    servo.writeMicroseconds(1300);
    delay(2000);
    servo.writeMicroseconds(1900);
  } else if (name == "Servo 4") {
    servo.writeMicroseconds(1100);
    delay(2000);
    servo.writeMicroseconds(1800);
  }

  sendLog("✅ " + name + " đã đóng.");
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("🔄 Đang kết nối WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ ESP8266 đã kết nối WiFi!");
  sendLog("\n✅ ESP8266 đã kết nối WiFi!");

  // Khởi tạo chân input (nhận tín hiệu từ Arduino)
  pinMode(BIN1_PIN, INPUT);
  pinMode(BIN2_PIN, INPUT);
  pinMode(BIN3_PIN, INPUT);
  pinMode(BIN4_PIN, INPUT);

  // Gắn servo
  servo1.attach(SERVO1_PIN, 500, 2500);
  servo2.attach(SERVO2_PIN, 500, 2500);
  servo3.attach(SERVO3_PIN, 500, 2500);
  servo4.attach(SERVO4_PIN, 500, 2500);

  // Đưa servo về vị trí ban đầu
  servo1.writeMicroseconds(1650);
  servo2.writeMicroseconds(2000);
  servo3.writeMicroseconds(1900);
  servo4.writeMicroseconds(1800);
}

void loop() {
  // 📤 Gửi dữ liệu trạng thái thùng rác
  int pinState[4] = {
    digitalRead(BIN1_PIN),
    digitalRead(BIN2_PIN),
    digitalRead(BIN3_PIN),
    digitalRead(BIN4_PIN)
  };

  for (int i = 0; i < 4; i++) {
    bool isFull = (pinState[i] == HIGH);
    if (isFull != lastBinState[i]) {
      lastBinState[i] = isFull;
      sendBinStatus(i, isFull);
    }
  }

  // 📡 Truy vấn server Flask để điều khiển servo
  WiFiClient client;
  HTTPClient http;
  http.begin(client, resultServerUrl);
  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("📥 Server trả về: " + response);

    if (response.indexOf("\"servo_id\":0") != -1) openServo(servo1, "Servo 1");
    else if (response.indexOf("\"servo_id\":1") != -1) openServo(servo2, "Servo 2");
    else if (response.indexOf("\"servo_id\":2") != -1) openServo(servo3, "Servo 3");
    else if (response.indexOf("\"servo_id\":3") != -1) openServo(servo4, "Servo 4");
    else Serial.println("⚠️ Không nhận diện được lệnh servo!");
  } else {
    Serial.println("❌ Không nhận được kết quả từ server Flask!");
  }
  http.end();

  delay(1000);  // Lặp mỗi giây
}
