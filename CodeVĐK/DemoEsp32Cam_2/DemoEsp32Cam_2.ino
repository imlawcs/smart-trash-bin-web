#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

// Cấu hình WiFi
const char* ssid = "Vsmax";  
const char* password = "08042004";  
const char* uploadUrl = "http://192.168.187.171:8000/predict";  
const char* statusUrl = "http://192.168.187.171:8000/check_status";  
const char* logServerUrl = "http://192.168.187.171:8000/log";  
const char* boundary = "----ESP32BOUNDARY";

#define IR_SENSOR_PIN 13 // Cảm biến hồng ngoại
#define SERVO_PIN 14

Servo doorServo;
// Hàm gửi log lên server
int detectionCount = 0; // Đếm số lần nhận diện
void sendLog(String message) {
    WiFiClient client;
    HTTPClient http;
    http.begin(client, logServerUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Thoát ký tự đặc biệt trong message để tránh JSON lỗi
    message.replace("\"", "\\\""); // Thoát dấu nháy kép
    String jsonPayload = "{\"log\": \"[Detection " + String(detectionCount) + "] " + message + "\"}";
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode != 200) {
        Serial.println("❌ Gửi log thất bại! Mã lỗi: " + String(httpResponseCode));
    }
    http.end();
}
bool checkProcessingStatus() {
    WiFiClient client;
    HTTPClient http;
    http.begin(client, statusUrl);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
        String response = http.getString();
        http.end();
        if (response.indexOf("\"status\": \"done\"") != -1) {
            sendLog("✅ Server đã xử lý xong.");
            return true;
        } else if (response.indexOf("\"status\": \"processing\"") != -1) {
            sendLog("⏳ Server đang xử lý...");
            return false;
        } else {
            sendLog("⚠️ Server rảnh, sẵn sàng nhận ảnh.");
            return false;
        }
    }
    sendLog("❌ Lỗi kết nối server khi kiểm tra trạng thái!");
    http.end();
    return false;
}
void sendImage() {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        sendLog("❌ Không thể chụp ảnh!");
        delay(1000);
        return;
    }
    sendLog("📷 Ảnh chụp thành công");
    
    if (WiFi.status() != WL_CONNECTED || WiFi.RSSI() < -80) {
        sendLog("⚠️ WiFi yếu (RSSI: " + String(WiFi.RSSI()) + " dBm), bỏ qua gửi ảnh!");
        esp_camera_fb_return(fb);
        return;
    }
    
    WiFiClient client;
    HTTPClient http;
    sendLog("🌐 Đang kết nối tới server...");
    http.begin(client, uploadUrl);
  
    http.setTimeout(15000); // Timeout 15 giây
    http.addHeader("Content-Type", "multipart/form-data; boundary=" + String(boundary));

    // Xây dựng body của request
    String head = "--" + String(boundary) + "\r\n"
                  "Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n"
                  "Content-Type: image/jpeg\r\n\r\n";

    String tail = "\r\n--" + String(boundary) + "--\r\n";

    // Tính toán tổng kích thước của request
    int contentLength = head.length() + fb->len + tail.length();
    http.addHeader("Content-Length", String(contentLength));

    // Mở kết nối HTTP
    int httpResponseCode = http.POST(head + String((const char*)fb->buf, fb->len) + tail);

    esp_camera_fb_return(fb);
    
    if (httpResponseCode > 0) {
        sendLog("✅ Ảnh đã gửi thành công! Phản hồi: " + http.getString());
    } else {
        sendLog("❌ Gửi ảnh thất bại! Lỗi: " + String(http.errorToString(httpResponseCode)));
    }
    http.end();
}
void sendFiveImages() {
    sendLog("⚠️ Bỏ qua ảnh đầu tiên để tránh ảnh cũ (làm sạch buffer)...");
    camera_fb_t *fb = esp_camera_fb_get();
    if (fb) {
        esp_camera_fb_return(fb);
    }
    delay(200); // Delay nhỏ để camera ổn định lại sau khi flush

    for (int i = 1; i <= 3; i++) {
        sendLog("📷 Gửi ảnh " + String(i) + " trên 3...");
        sendImage();
        delay(1000);  // Bạn có thể chỉnh lại delay tùy tốc độ mạng
    }
}
// Hàm điều khiển servo
void closeDoor() {
    doorServo.write(0);  
    sendLog("🚪 Cửa chắn đã đóng.");
}

void openDoor() {
    doorServo.write(180); 
    sendLog("🚪 Cửa chắn đã mở.");
}
void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    sendLog("🔄 Đang kết nối WiFi...");
    Serial.println("🔄 Đang kết nối WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        sendLog(".");
    }
    
    sendLog("✅ ESP32-CAM đã kết nối WiFi!");
    Serial.println("✅ ESP32-CAM đã kết nối WiFi!");

    doorServo.attach(SERVO_PIN);
    openDoor();

    IPAddress serverIP;
    if (WiFi.hostByName("192.168.90.171", serverIP)) {
      Serial.println("✅ Có thể truy cập server từ ESP32-CAM!");
    } else {
      Serial.println("❌ Không thể truy cập server từ ESP32-CAM!");
    }

    pinMode(IR_SENSOR_PIN, INPUT);

    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = 5;
    config.pin_d1 = 18;
    config.pin_d2 = 19;
    config.pin_d3 = 21;
    config.pin_d4 = 36;
    config.pin_d5 = 39;
    config.pin_d6 = 34;
    config.pin_d7 = 35;
    config.pin_xclk = 0;
    config.pin_pclk = 22;
    config.pin_vsync = 25;
    config.pin_href = 23;
    config.pin_sccb_sda = 26;
    config.pin_sccb_scl = 27;
    config.pin_pwdn = 32;
    config.pin_reset = -1;
    config.xclk_freq_hz = 20000000;
    config.frame_size = FRAMESIZE_VGA; // Thay đổi độ phân giải
    config.pixel_format = PIXFORMAT_JPEG;
    config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.jpeg_quality = 12;
    config.fb_count = 1;

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("❌ Lỗi khởi tạo camera! Mã lỗi: 0x%x\n", err);
        sendLog("❌ Lỗi khởi tạo camera!");
        return;
    } else {
        Serial.println("✅ Camera đã khởi động thành công!");
        sendLog("✅ Camera đã khởi động thành công!");
        // Chụp ảnh dummy để camera ổn định
        camera_fb_t *fb = esp_camera_fb_get();
        if (fb) {
            esp_camera_fb_return(fb);
            sendLog("📷 Đã chụp ảnh dummy để ổn định camera");
        }
        delay(500);
    }
    Serial.print("IP ESP32: ");
    Serial.println(WiFi.localIP());
    Serial.print("Gateway: ");
    Serial.println(WiFi.gatewayIP());
    Serial.print("Subnet Mask: ");
    Serial.println(WiFi.subnetMask());
}
bool isDetecting = false; // Trạng thái đang nhận diện
void loop() {
    bool currentState = (digitalRead(IR_SENSOR_PIN) == LOW);
    
    if (currentState && !isDetecting) { // Bắt đầu lần nhận diện 5 ảnh mới
        detectionCount++;
        isDetecting = true;
        sendLog("📷 Phát hiện vật cản, bắt đầu lần nhận diện 3 ảnh...");
        sendLog("👀 Chờ 3s để ổn định...");
        delay(3000);
        closeDoor();
        sendFiveImages(); // Gửi ảnh bất kể trạng thái server
        sendLog("✅ Hoàn thành gửi 3 ảnh. Chờ server xử lý...");

        if (checkProcessingStatus()) {
            sendLog("⏸ Server đã xử lý xong.");
        } else {
            sendLog("⚠️ Server đang rảnh hoặc xử lý, ảnh đã được gửi.");
        }
        delay(3000); // Chờ 3 giây trước khi kết thúc lần nhận diện
    } else if (!currentState && isDetecting) { // Kết thúc lần nhận diện
        isDetecting = false;
        sendLog("✅ Kết thúc lần nhận diện.");
        openDoor();
    }
    delay(500);
}