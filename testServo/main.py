from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import ServoControl
import predict
import socket

app = FastAPI()

# Mount static files and templates
templates = Jinja2Templates(directory="templates")

@app.get("/")
def home():
    return {"message": "Server is running!"}

# Đăng ký các route
app.include_router(predict.router)
app.include_router(ServoControl.router)

# Lấy địa chỉ IP của máy chủ
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Server đang chạy tại: http://{local_ip}:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)