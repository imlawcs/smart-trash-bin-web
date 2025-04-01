from flask import Flask, request, jsonify
import os
import time
import datetime
import random

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Biến lưu trữ kết quả sau khi xử lý ảnh
processing_result = None  

@app.route('/log', methods=['POST'])
def receive_log():
    log_data = request.json.get("log")
    print(f"📡 Log từ ESP32-CAM: {log_data}")
    return "Log nhận thành công!", 200
    
@app.route('/upload', methods=['POST'])
def upload_image():
    global processing_result
    print("📩 Nhận yêu cầu từ ESP32-CAM!")

    # Kiểm tra xem có dữ liệu ảnh không
    if request.content_length == 0:
        print("❌ Không có dữ liệu trong request!")
        return jsonify({"error": "Không có dữ liệu"}), 400

    # Tạo tên file dựa trên timestamp
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{UPLOAD_FOLDER}/captured_{timestamp}.jpg"
    
    try:
        with open(filename, "wb") as f:
            f.write(request.data)
        print(f"📸 Ảnh đã lưu: {filename} ({os.path.getsize(filename)} bytes)")

        # Mô phỏng quá trình xử lý ảnh (5 giây)
        time.sleep(5)
        processing_result = random.choice(["servo1", "servo2", "servo3", "servo4"])
        print(f"🔄 Xử lý ảnh xong, mở {processing_result}")

        return jsonify({"message": "Ảnh nhận thành công!", "file": filename}), 200
    except Exception as e:
        print(f"❌ Lỗi lưu ảnh: {str(e)}")
        return jsonify({"error": f"Lỗi lưu ảnh: {str(e)}"}), 500

@app.route('/get_result', methods=['GET'])
def get_result():
    global processing_result
    if processing_result:
        response = {"servo": processing_result}
        processing_result = None  # Xóa kết quả sau khi gửi
        return jsonify(response)
    return jsonify({"message": "Chưa có dữ liệu"}), 202  # 202 = Chưa có dữ liệu sẵn sàng

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
