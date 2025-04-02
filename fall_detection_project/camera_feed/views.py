import cv2
import mediapipe as mp
import numpy as np
import csv
import time
import os
import pickle
from datetime import datetime
import joblib
from django.conf import settings
from django.http import StreamingHttpResponse, JsonResponse
from django.shortcuts import render
from django.core.cache import cache
import subprocess

def get_camera_page(request):
    recordings_dir = os.path.join(settings.MEDIA_ROOT, 'recordings')
    
    video_files = []
    if os.path.exists(recordings_dir):
        video_files = [f for f in os.listdir(recordings_dir) if f.endswith(('.mp4', '.avi', '.mov'))]

    context = {
        'videos': video_files,
        'MEDIA_URL': settings.MEDIA_URL  
    }

    return render(request, "camera_feed.html", context)


def gen_frames():
    model_dir = os.path.join(settings.BASE_DIR, 'camera_feed', 'static', 'KNN_model')
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    model_path = os.path.join(model_dir, 'knn_model.pkl')

    try:
        scaler = joblib.load(scaler_path)
        with open(model_path, 'rb') as model_file:
            knn_model = pickle.load(model_file)
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return

    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    non_face_indices = list(range(11, 33))

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return

    # Create necessary directories
    recordings_dir = os.path.join(settings.MEDIA_ROOT, 'recordings')
    os.makedirs(recordings_dir, exist_ok=True)

    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

    # Generate a unique log file with timestamp
    timestamp_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_filename = 'fall_detection_log.csv'
    log_path = os.path.join(settings.MEDIA_ROOT, log_filename)

    fall_start_time = None
    recording = False
    video_filename = None
    fall_video_writer = None
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    file_exists = os.path.isfile(log_path)

    with open(log_path, 'a', newline='') as log_file:
        writer = csv.writer(log_file)
        if not file_exists:
            writer.writerow(["Timestamp", "Status"]) 

        with mp_pose.Pose(min_detection_confidence=0.3, min_tracking_confidence=0.3) as pose:
            while True:
                success, frame = cap.read()
                if not success:
                    break

                image = cv2.resize(frame, (640, 480))
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                results = pose.process(image_rgb)

                label = "No Pose Detected"
                fall_detected = False

                if results.pose_landmarks:
                    height, width, _ = image.shape
                    landmarks = results.pose_landmarks.landmark
                    filtered_landmarks = [landmarks[i] for i in non_face_indices]

                    x_coords = [lm.x * width for lm in filtered_landmarks]
                    y_coords = [lm.y * height for lm in filtered_landmarks]
                    visibilities = [lm.visibility for lm in filtered_landmarks]

                    x_min, x_max = min(x_coords), max(x_coords)
                    y_min, y_max = min(y_coords), max(y_coords)

                    features_input = np.array([
                        np.mean(x_coords),
                        np.mean(y_coords),
                        np.mean(visibilities),
                        x_max - x_min,
                        y_max - y_min
                    ])

                    features_input_scaled = scaler.transform([features_input])
                    '''
                    To output a real time feed from the code below the prediction variable consists of the prediction
                    made by the model, simply output that onto a graph and you'll get either a 1 (fall) or 0 (non-fall)
                    '''
                    prediction = knn_model.predict(features_input_scaled)[0]
                    label = "Falling" if prediction == 1 else "Not Falling"
                    fall_detected = True if prediction == 1 else False

                    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    writer.writerow([current_time, 1 if fall_detected else 0])  # Store falls as 1, non-falls as 0

                    cache.set('fall_detected', fall_detected, timeout=10)

                    if prediction == 1:
                        if fall_start_time is None:
                            fall_start_time = time.time()
                            video_filename = os.path.join(recordings_dir, f"fall_{timestamp_str}.mp4")
                            fall_video_writer = cv2.VideoWriter(video_filename, fourcc, 20.0, (640, 480))
                            recording = True

                        if recording:
                            fall_video_writer.write(image)
                    else:
                        if fall_start_time is not None:
                            fall_duration = time.time() - fall_start_time
                            if fall_duration < 5 and recording:
                                fall_video_writer.release()
                                os.remove(video_filename)
                            elif fall_duration >= 5 and recording:
                                fall_video_writer.release()
                            fall_start_time = None
                            recording = False

                    mp_drawing.draw_landmarks(
                        image,
                        results.pose_landmarks,
                        mp_pose.POSE_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                        mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2),
                    )
                    cv2.rectangle(image, (int(x_min), int(y_min)), (int(x_max), int(y_max)), (0, 255, 0), 2)
                    cv2.putText(image, label, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

                ret, buffer = cv2.imencode('.jpg', image)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()
    if fall_video_writer is not None:
        fall_video_writer.release()

    print(f"Fall detection log saved to: {log_path}")

def get_fall_status(request):
    fall_detected = cache.get('fall_detected', False)
    return JsonResponse({'fall_detected': fall_detected})

def camera_feed(request):
    return StreamingHttpResponse(gen_frames(), content_type='multipart/x-mixed-replace; boundary=frame')