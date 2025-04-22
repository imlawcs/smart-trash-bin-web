from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import os
import threading
import concurrent.futures
from collections import Counter
from services.servoControl import set_servo_command
from torchvision import models
import torch.nn as nn
import time
from datetime import datetime

router = APIRouter()

# processing_result = None  
# result_ready = False  
# processing_status = False  # Cờ để báo server đang xử lý
# status_ready = False  # Cờ báo ESP32-CAM dừng gửi ảnh

# Thư mục lưu ảnh nhận được
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "received_images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Danh sách nhãn rác và ID servo (Thứ tự khớp với huấn luyện)
TRASH_LABELS = ['metal', 'paper', 'plastic', 'trash_cardboard', 'trash_trash']
TRASH_CATEGORIES = {
    'metal': 0,
    'paper': 1,
    'plastic': 2,
    'trash_cardboard': 3,
    'trash_trash': 3  # Gộp chung 1 servo
}
num_classes = len(TRASH_LABELS)  # Đảm bảo đúng số lớp

# Khởi tạo mô hình MobileNetV2 với pretrained weights
def load_model():
    try:
        model = models.mobilenet_v2(pretrained=True)  # Dùng pretrained weights
        model.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(model.last_channel, num_classes)
        )
        # Đường dẫn đến mô hình đã huấn luyện
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "model.pth")

        # Kiểm tra nếu tệp mô hình tồn tại
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Không tìm thấy tệp mô hình tại: {MODEL_PATH}")
            
        model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
        model.eval()  # Chuyển mô hình sang chế độ đánh giá
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

# Tiền xử lý ảnh giống `test.ipynb`
IMG_SIZE = 224
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomRotation(30),  # Xoay ảnh ngẫu nhiên
    transforms.RandomHorizontalFlip(),  # Lật ngang ảnh
    transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0)),  # Cắt ngẫu nhiên
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Biến lưu kết quả
results = []
processing_status = False
status_ready = False
lock = threading.Lock()

def process_image(image_bytes):
    global results, processing_status, status_ready
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            outputs = model(img_tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probs, 1)
            trash_type = TRASH_LABELS[predicted.item()]
            
            with lock:
                results.append(trash_type)
                if len(results) == 5:
                    final_result = Counter(results).most_common(1)[0][0]
                    set_servo_command(final_result, TRASH_CATEGORIES[final_result])
                    results.clear()
                    status_ready = True
                    processing_status = False
        
        return trash_type, confidence.item()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Không thể xử lý ảnh: {str(e)}")
    
@router.post('/log')
async def receive_log(request: Request):
    log_data = await request.json()
    log_message = log_data.get("log")
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] 📡 Log từ ESP32-CAM: {log_message}")
    return {"message": "Log nhận thành công!"}


@router.post("/predict")
async def predict_trash(file: UploadFile = File(...)):
    try:
        # Kiểm tra nếu mô hình đã tải
        if model is None:
            raise HTTPException(status_code=500, detail="Mô hình chưa được tải thành công")
            
        # Kiểm tra loại tệp tin
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận tệp ảnh .png, .jpg hoặc .jpeg")
        
        image_bytes = await file.read()
        
        # Lưu ảnh vào thư mục
        timestamp = int(time.time())
        image_filename = f"{timestamp}.jpg"
        image_path = os.path.join(UPLOAD_FOLDER, image_filename)
        
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        global processing_status
        processing_status = True
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future = executor.submit(process_image, image_bytes)
            trash_type, confidence_value = future.result()
    
        return {
            "trash_type": trash_type,
            "confidence": f"{confidence_value:.2f}",
            "servo_id": TRASH_CATEGORIES[trash_type],
            "image_saved": image_filename
        }
        print(trash_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý: {str(e)}")  

@router.get('/check_status')
async def check_status():
    global status_ready
    if processing_status:
        return {"status": "processing"}, 202  
    elif status_ready:
        status_ready = False  
        return {"status": "done"}, 200  
    return {"status": "idle"}, 204   