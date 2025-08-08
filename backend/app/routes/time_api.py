from fastapi import APIRouter
import time

time_router = APIRouter(prefix="/api/time", tags=["alarms"])

@time_router.get("")
def get_time() -> dict[str, int]:
    return {
        "timestamp": time.localtime().tm_gmtoff + int(time.time()),
    }