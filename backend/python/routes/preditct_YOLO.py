from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
from collections import Counter
import logging
import io
import time
from ultralytics import YOLO
import numpy as np
from services.servoControl import set_servo_command

router = APIRouter()

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
MODEL_PATH = "models/best.pt"
try:
    model = YOLO(MODEL_PATH)
    logging.info("YOLO model loaded successfully.")
except Exception as e:
    model = None
    logging.error(f"Failed to load YOLO model: {str(e)}")

results = []
processing_status = False
status_ready = False

@router.post("/predict")
async def predict_trash(file: UploadFile = File(...)):
    global processing_status, status_ready

    if model is None:
        raise HTTPException(status_code=500, detail="YOLO model not loaded.")

    try:
        if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            raise HTTPException(status_code=400, detail="Only .jpg, .jpeg, .png supported")

        image_bytes = await file.read()
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

        # Gửi lệnh mở servo tương ứng
        servo_id = TRASH_CATEGORIES.get(most_common_label, 4)
        set_servo_command(most_common_label, servo_id)

        status_ready = True
        return {
            "trash_type": most_common_label,
            "confidence": round(average_conf, 2),
            "servo_id": servo_id
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
