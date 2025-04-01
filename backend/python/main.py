from fastapi import FastAPI
from services import servoControl
from routes import predict  # Thêm predict
import socket

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Server is running!"}

# Đăng ký các route
app.include_router(predict.router)  # API /predict
app.include_router(servoControl.router)  # API /get-servo-command

# Lấy địa chỉ IP của máy chủ
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Server đang chạy tại: http://{local_ip}:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
