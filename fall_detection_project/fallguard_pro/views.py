import cv2
from django.http import StreamingHttpResponse
from django.shortcuts import render

def get_camera_page(request):
    return render(request, "camera_feed.html")

def gen_frames():
    cap = cv2.VideoCapture(0)  # 0 for the default camera
    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            # Encode the frame in JPEG format
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            
            # Yield the frame for streaming
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def camera_feed(request):
    return StreamingHttpResponse(gen_frames(), content_type='multipart/x-mixed-replace; boundary=frame')
