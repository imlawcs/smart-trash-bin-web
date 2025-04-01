from fastapi import APIRouter, UploadFile, File
import torch
from torchvision import transforms
from PIL import Image
import io
import os
from services.servoControl import set_servo_command
from torchvision import models
import torch.nn as nn

router = APIRouter()

# Danh sách nhãn rác và ID servo
TRASH_CATEGORIES = {
    "plastic": 0,
    "trash": 1,
    "paper": 2,
    "metal": 3
}
TRASH_LABELS = list(TRASH_CATEGORIES.keys())

num_classes = 4  # Thay bằng số lớp thực tế

model = models.mobilenet_v2(pretrained=False)
model.classifier = nn.Sequential(
    nn.Dropout(0.4),
    nn.Linear(model.last_channel, num_classes)
)

# model_save_path = r"E:\SCHOOL\HK6\CODE6\PBL5\server_code\model.pth"
# Lấy đường dẫn thư mục hiện tại của script đang chạy
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Nối đường dẫn đến thư mục models
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "model.pth")
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))

# Hàm xử lý ảnh
def transform_image(image_bytes):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return transform(image).unsqueeze(0)

@router.post("/predict")
async def predict_trash(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img_tensor = transform_image(image_bytes)

    # Dự đoán loại rác
    with torch.no_grad():
        outputs = model(img_tensor)
        _, predicted = torch.max(outputs, 1)
        trash_type = TRASH_LABELS[predicted.item()]

    # Lưu loại rác vào bộ nhớ để ESP lấy lệnh
    set_servo_command(trash_type)

    return {"trash_type": trash_type, "servo_id": TRASH_CATEGORIES[trash_type]}

