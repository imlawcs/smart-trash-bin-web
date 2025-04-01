from fastapi import APIRouter

router = APIRouter()

# Biến lưu loại rác mới nhất
latest_trash_type = None

def set_servo_command(trash_type, idServo):
    global latest_trash_type, servo_id
    latest_trash_type = trash_type
    servo_id = idServo

@router.get("/get-result")
async def get_servo_command():
    global latest_trash_type, servo_id

    if latest_trash_type is not None:
        command = latest_trash_type
        idServo = servo_id
        servo_id = None
        latest_trash_type = None  # Reset sau khi ESP lấy lệnh
        return {
            "trash_type": command,
            "servo_id": idServo
        }
    
    return {"trash_type": None}  # Không có lệnh mới
