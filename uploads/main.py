from fastapi import FastAPI, File, UploadFile
import torch
import cv2
import numpy as np

app = FastAPI()

# Load mô hình từ file .pth
model = torch.load("model.pth", map_location=torch.device("cpu"))
model.eval()

# Danh sách loại rác theo thứ tự model trả về
TRASH_CLASSES = ["plastic", "trash", "paper", "metal"]

# Biến lưu loại rác mới nhất
latest_trash_type = None

# Hàm nhận diện loại rác
def predict(image):
    image = cv2.resize(image, (224, 224))
    image = np.transpose(image, (2, 0, 1)) / 255.0  # Chuẩn hóa
    image = torch.tensor(image, dtype=torch.float32).unsqueeze(0)

    with torch.no_grad():
        output = model(image)
        predicted_class = torch.argmax(output, dim=1).item()

    return TRASH_CLASSES[predicted_class]

# API nhận ảnh từ ESP32
@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    global latest_trash_type

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    latest_trash_type = predict(image)  # Xác định loại rác

    return {"message": "Processed", "trash_type": latest_trash_type}

# API để ESP8266 lấy loại rác mới nhất
@app.get("/get-trash/")
async def get_trash_type():
    global latest_trash_type
    if latest_trash_type:
        trash = latest_trash_type
        latest_trash_type = None  # Reset sau khi lấy
        return {"trash_type": trash}
    return {"trash_type": "none"}

# Chạy server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
