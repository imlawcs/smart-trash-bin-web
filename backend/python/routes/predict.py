from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import os
from services.servoControl import set_servo_command
from torchvision import models
import torch.nn as nn
import time
from datetime import datetime

router = APIRouter()

processing_result = None  
result_ready = False  
processing_status = False  # Cờ để báo server đang xử lý
status_ready = False  # Cờ báo ESP32-CAM dừng gửi ảnh

# Thư mục lưu ảnh nhận được
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "received_images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Danh sách nhãn rác đã huấn luyện (thứ tự đúng với mô hình)
TRASH_LABELS = ['metal', 'paper', 'plastic', 'trash_cardboard', 'trash_trash']

# Gộp trash_cardboard và trash_trash cùng 1 servo_id (3)
TRASH_CATEGORIES = {
    'metal': 0,
    'paper': 1,
    'plastic': 2,
    'trash_cardboard': 3,
    'trash_trash': 3
}

num_classes = len(TRASH_LABELS)  # Số lớp đầu ra của mô hình

# Khởi tạo mô hình MobileNetV2 với pretrained weights
def load_model():
    try:
        model = models.mobilenet_v2(pretrained=True)
        model.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(model.last_channel, num_classes)
        )
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "model.pth")

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Không tìm thấy tệp mô hình tại: {MODEL_PATH}")
            
        model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
        model.eval()
        return model
    except Exception as e:
        print(f"Lỗi khi tải mô hình: {e}")
        raise

# Tải mô hình khi khởi động server
try:
    model = load_model()
except Exception as e:
    print(f"Không thể tải mô hình: {e}")
    model = None

# Tiền xử lý ảnh
IMG_SIZE = 224
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomRotation(30),
    transforms.RandomHorizontalFlip(),
    transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@router.post('/log')
async def receive_log(request: Request):
    log_data = await request.json()
    log_message = log_data.get("log")
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] 📡 Log từ ESP32-CAM: {log_message}")
    return {"message": "Log nhận thành công!"}

@router.get('/check_status')
async def check_status():
    global status_ready
    if processing_status:
        return {"status": "processing"}, 202  
    elif status_ready:
        status_ready = False  
        return {"status": "done"}, 200  
    return {"status": "idle"}, 204   

@router.post("/predict")
async def predict_trash(file: UploadFile = File(...)):
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Mô hình chưa được tải thành công")
            
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận tệp ảnh .png, .jpg hoặc .jpeg")
        
        image_bytes = await file.read()

        # Lưu ảnh vào thư mục
        timestamp = int(time.time())
        image_filename = f"{timestamp}.jpg"
        image_path = os.path.join(UPLOAD_FOLDER, image_filename)
        
        with open(image_path, "wb") as f:
            f.write(image_bytes)

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img_tensor = transform(image).unsqueeze(0)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Không thể xử lý ảnh: {str(e)}")

        with torch.no_grad():
            outputs = model(img_tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probs, 1)
            trash_type = TRASH_LABELS[predicted.item()]
            confidence_value = confidence.item()

        # Gửi lệnh điều khiển servo
        servo_id = TRASH_CATEGORIES[trash_type]
        set_servo_command(trash_type, servo_id)

        return {
            "trash_type": trash_type,
            "confidence": f"{confidence_value:.2f}",
            "servo_id": servo_id,
            "image_saved": image_filename
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý: {str(e)}")
