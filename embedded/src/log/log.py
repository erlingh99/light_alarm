import time

def log(msg: str):
    timestamp = time.localtime()
    print("[%04d-%02d-%02d %02d:%02d:%02d] %s" % (
        timestamp[0], timestamp[1], timestamp[2],
        timestamp[3], timestamp[4], timestamp[5], msg))
