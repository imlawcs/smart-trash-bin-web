from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from PIL import Image
from collections import Counter
import logging
import io
import os
import time
from ultralytics import YOLO
import numpy as np
from services.servoControl import set_servo_command
import threading
from datetime import datetime

router = APIRouter()

# Tạo thư mục lưu ảnh nếu chưa có
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "received_images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Danh sách nhãn theo thứ tự training
CLASS_NAMES = ['metal', 'paper', 'plastic', 'trash', 'cardboard']
TRASH_CATEGORIES = {
    'metal': 0,
    'paper': 1,
    'plastic': 2,
    'trash': 3,
    'cardboard': 3
}
# Load mô hình YOLOv8 đã train
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "best.pt")
try:
    model = YOLO(MODEL_PATH)
    logging.info("YOLO model loaded successfully.")
except Exception as e:
    model = None
    logging.error(f"Failed to load YOLO model: {str(e)}")

results = []
processing_status = False
status_ready = False
lock = threading.Lock()

@router.post("/predict")
async def predict_trash(file: UploadFile = File(...)):
    global processing_status, status_ready, results

    if model is None:
        raise HTTPException(status_code=500, detail="YOLO model not loaded.")

    try:
        if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            raise HTTPException(status_code=400, detail="Only .jpg, .jpeg, .png supported")

        image_bytes = await file.read()

        # Lưu ảnh vào thư mục
        timestamp = int(time.time())
        image_filename = f"{timestamp}.jpg"
        image_path = os.path.join(UPLOAD_FOLDER, image_filename)
        with open(image_path, "wb") as f:
            f.write(image_bytes)

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        processing_status = True
        pred_results = model.predict(image, conf=0.2)
        processing_status = False

        if not pred_results or not pred_results[0].boxes:
            raise HTTPException(status_code=400, detail="No trash detected.")

        boxes = pred_results[0].boxes
        labels = [CLASS_NAMES[int(cls)] for cls in boxes.cls]
        confidences = boxes.conf.cpu().numpy()

        most_common_label = Counter(labels).most_common(1)[0][0]
        average_conf = float(np.mean([conf for i, conf in enumerate(confidences) if labels[i] == most_common_label]))

        with lock:
            results.append((most_common_label, average_conf))
            if len(results) == 3:
                label_counts = Counter(label for label, _ in results)
                final_label = label_counts.most_common(1)[0][0]
                final_conf = np.mean([conf for label, conf in results if label == final_label])

                # Gửi lệnh điều khiển servo
                servo_id = TRASH_CATEGORIES.get(final_label, 4)
                set_servo_command(final_label, servo_id)

                results.clear()
                status_ready = True
                processing_status = False

                return {
                    "trash_type": final_label,
                    "confidence": round(final_conf, 2),
                    "servo_id": servo_id,
                    "image_saved": image_filename,
                    "message": "✅ Đã xử lý 3 ảnh và xác định kết quả cuối cùng."
                }

        return {
            "trash_type": most_common_label,
            "confidence": round(average_conf, 2),
            "servo_id": TRASH_CATEGORIES[most_common_label],
            "image_saved": image_filename,
            "message": "✅ Đã xử lý 1 ảnh, chờ đủ 5 ảnh để xác định kết quả."
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get('/check_status')
async def check_status():
    global status_ready
    if processing_status:
        return {"status": "processing"}, 202
    elif status_ready:
        status_ready = False
        return {"status": "done"}, 200
    return {"status": "idle"}, 204

@router.post('/log')
async def receive_log(request: Request):
    log_data = await request.json()
    log_message = log_data.get("log", "")
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] 📡 Log từ ESP32-CAM: {log_message}")
    return {"message": "✅ Log nhận thành công!"}

