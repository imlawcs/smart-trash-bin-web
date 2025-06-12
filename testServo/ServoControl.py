from fastapi import APIRouter, HTTPException
from datetime import datetime

router = APIRouter()

# Biến lưu loại rác và ID servo mới nhất
latest_trash_type = None
servo_id = None

def set_servo_command(trash_type, idServo):
    global latest_trash_type, servo_id
    latest_trash_type = trash_type
    servo_id = idServo
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 📡 Servo command set: trash_type={trash_type}, servo_id={idServo}")

@router.get("/get-result")
async def get_servo_command():
    global latest_trash_type, servo_id

    if latest_trash_type is not None:
        command = latest_trash_type
        current_servo_id = servo_id
        servo_id = None
        latest_trash_type = None  # Reset sau khi ESP lấy lệnh
        print(f"[{datetime.now().strftime('%H:%M:%S')}] 📡 Servo command sent to ESP: trash_type={command}, servo_id={current_servo_id}")
        return {
            "trash_type": command,
            "servo_id": current_servo_id
        }
    
    return {"trash_type": None}  # Không có lệnh mới

@router.post("/set-servo/{servo_id}")
async def set_manual_servo(servo_id: int):
    if servo_id not in [0, 1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid servo ID. Must be 0, 1, 2, or 3.")
    
    trash_types = ["metal", "paper", "plastic", "trash"]
    set_servo_command(trash_types[servo_id], servo_id)
    return {"message": f"Servo {servo_id} ({trash_types[servo_id]}) command set successfully."}