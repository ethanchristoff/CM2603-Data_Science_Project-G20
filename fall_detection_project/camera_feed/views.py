import csv
import os
import pickle
import time
from collections.abc import Generator
from datetime import datetime
from typing import Any

import cv2
import joblib
import mediapipe as mp
import numpy as np
import psutil
from django.conf import settings
from django.core.cache import cache
from django.http import HttpRequest, HttpResponse, JsonResponse, StreamingHttpResponse
from django.shortcuts import render

# --- Constants ---
PID_FILENAME: str = "process.pid"
RECORDINGS_DIR_NAME: str = 'recordings'
VIDEO_EXTENSIONS: tuple[str, ...] = ('.mp4', '.avi', '.mov')

# Constants for gen_frames
MODEL_STATIC_SUBDIR: str = 'static'
MODEL_DIR_NAME: str = 'KNN_model'
SCALER_FILENAME: str = 'scaler.pkl'
MODEL_FILENAME: str = 'knn_model.pkl'
LOG_FILENAME_FALL_DETECTION: str = 'fall_detection_log.csv'

NON_FACE_LANDMARK_INDICES: list[int] = list(range(11, 33)) # Indices for landmarks excluding face
VIDEO_FOURCC_CODEC: str = 'mp4v'
MIN_FALL_RECORDING_DURATION_SEC: int = 5
CAMERA_INDEX: int = 0 # Or other appropriate camera index
FRAME_WIDTH: int = 640
FRAME_HEIGHT: int = 480
VIDEO_FPS: float = 20.0
POSE_MIN_DETECTION_CONFIDENCE: float = 0.3
POSE_MIN_TRACKING_CONFIDENCE: float = 0.3

# Drawing specs
LANDMARK_DRAWING_SPEC = mp.solutions.drawing_utils.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2)
CONNECTION_DRAWING_SPEC = mp.solutions.drawing_utils.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
BBOX_COLOR: tuple[int, int, int] = (0, 255, 0) # Green
TEXT_COLOR: tuple[int, int, int] = (0, 0, 255) # Red


def get_camera_page(request: HttpRequest) -> HttpResponse:
    """
    Stops any running background fall detection processes (identified by a PID file),
    lists available video recordings from the media directory, and renders the
    camera feed page.

    Args:
        request: The HttpRequest object.

    Returns:
        An HttpResponse object rendering the camera_feed.html template.
    """
    print("Attempting to stop background threads if any...")

    if os.path.exists(PID_FILENAME):
        try:
            with open(PID_FILENAME) as f:
                pid = int(f.read().strip())

            process = psutil.Process(pid)
            process.terminate()  # Gracefully stop the process
            process.wait(timeout=5)  # Wait for process to terminate
            print(f"Terminated process with PID: {pid}")
        except psutil.NoSuchProcess:
            print(f"No process found with PID {pid}, or it already exited.")
        except psutil.TimeoutExpired:
            print(f"Timeout waiting for process {pid} to terminate. Forcing kill.")
            process.kill()
            process.wait()
            print(f"Killed process with PID: {pid}")
        except (OSError, ValueError) as e:
            print(f"Error reading or parsing PID file: {e}")
        finally:
            if os.path.exists(PID_FILENAME):
                os.remove(PID_FILENAME)
    else:
        print("No PID file found. Assuming no controlled process is running.")

    recordings_full_dir = os.path.join(settings.MEDIA_ROOT, RECORDINGS_DIR_NAME)

    video_files: list[str] = []
    if os.path.exists(recordings_full_dir):
        video_files = [
            f for f in os.listdir(recordings_full_dir)
            if f.endswith(VIDEO_EXTENSIONS)
        ]

    context: dict[str, Any] = {
        'videos': video_files,
        'MEDIA_URL': settings.MEDIA_URL
    }
    return render(request, "camera_feed.html", context)


def gen_frames() -> Generator[bytes, None, None]:
    """
    Captures video from the camera, performs real-time fall detection using a
    pre-trained KNN model, logs detection events, records video clips of falls
    lasting at least MIN_FALL_RECORDING_DURATION_SEC seconds, and yields JPEG
    encoded frames for streaming.

    Yields:
        bytes: A byte string representing a JPEG encoded frame, formatted for
               multipart/x-mixed-replace streaming.
    """
    model_base_path = os.path.join(settings.BASE_DIR, 'camera_feed', MODEL_STATIC_SUBDIR, MODEL_DIR_NAME)
    scaler_path = os.path.join(model_base_path, SCALER_FILENAME)
    model_path = os.path.join(model_base_path, MODEL_FILENAME)

    try:
        scaler = joblib.load(scaler_path)
        with open(model_path, 'rb') as model_file:
            knn_model = pickle.load(model_file)
    except FileNotFoundError:
        print(f"Error: Model or scaler file not found. Searched in {model_base_path}")
        return
    except Exception as e:
        print(f"Error loading model or scaler: {e!s}")
        return

    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print(f"Error: Could not open camera with index {CAMERA_INDEX}.")
        return

    recordings_full_dir = os.path.join(settings.MEDIA_ROOT, RECORDINGS_DIR_NAME)
    os.makedirs(recordings_full_dir, exist_ok=True)
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True) # Ensure MEDIA_ROOT exists

    log_path = os.path.join(settings.MEDIA_ROOT, LOG_FILENAME_FALL_DETECTION)

    fall_start_time: float | None = None
    recording: bool = False
    video_filename: str | None = None
    fall_video_writer: cv2.VideoWriter | None = None
    fourcc = cv2.VideoWriter_fourcc(*VIDEO_FOURCC_CODEC)

    file_exists = os.path.isfile(log_path)

    try:
        with open(log_path, 'a', newline='') as log_file:
            writer = csv.writer(log_file)
            if not file_exists or os.path.getsize(log_path) == 0:
                writer.writerow(["Timestamp", "Status (1=Fall, 0=NoFall)"])

            with mp_pose.Pose(
                min_detection_confidence=POSE_MIN_DETECTION_CONFIDENCE,
                min_tracking_confidence=POSE_MIN_TRACKING_CONFIDENCE
            ) as pose:
                while True:
                    success, frame = cap.read()
                    if not success:
                        print("Failed to grab frame from camera. Exiting.")
                        break

                    image = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
                    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    results = pose.process(image_rgb)

                    label = "No Pose Detected"
                    fall_detected = False

                    if results.pose_landmarks:
                        height, width, _ = image.shape
                        landmarks = results.pose_landmarks.landmark

                        # Use only non-face landmarks for feature extraction
                        filtered_landmarks = [landmarks[i] for i in NON_FACE_LANDMARK_INDICES if i < len(landmarks)]

                        if not filtered_landmarks:
                            label = "Relevant landmarks not visible"
                        else:
                            x_coords = [lm.x * width for lm in filtered_landmarks]
                            y_coords = [lm.y * height for lm in filtered_landmarks]
                            visibilities = [lm.visibility for lm in filtered_landmarks]

                            x_min, x_max = min(x_coords), max(x_coords)
                            y_min, y_max = min(y_coords), max(y_coords)

                            features_input = np.array([
                                np.mean(x_coords), np.mean(y_coords),
                                np.mean(visibilities),
                                x_max - x_min, y_max - y_min
                            ])

                            features_input_scaled = scaler.transform([features_input])
                            prediction = knn_model.predict(features_input_scaled)[0]

                            label = "Falling" if prediction == 1 else "Not Falling"
                            fall_detected = (prediction == 1)

                            current_time_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                            writer.writerow([current_time_str, 1 if fall_detected else 0])
                            log_file.flush()

                            cache.set('fall_detected', bool(fall_detected), timeout=10) # Cache status for 10s

                            if fall_detected:
                                if fall_start_time is None:
                                    fall_start_time = time.time()
                                    current_fall_timestamp_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                                    video_filename = os.path.join(recordings_full_dir, f"fall_{current_fall_timestamp_str}.mp4")
                                    fall_video_writer = cv2.VideoWriter(video_filename, fourcc, VIDEO_FPS, (FRAME_WIDTH, FRAME_HEIGHT))
                                    recording = True

                                if recording and fall_video_writer:
                                    fall_video_writer.write(image)
                            else: # Not falling
                                if fall_start_time is not None and fall_video_writer: # Was previously falling
                                    fall_duration = time.time() - fall_start_time
                                    if fall_duration < MIN_FALL_RECORDING_DURATION_SEC and recording:
                                        print(f"Fall duration {fall_duration:.2f}s < {MIN_FALL_RECORDING_DURATION_SEC}s. Discarding video: {video_filename}")
                                        fall_video_writer.release()
                                        if video_filename and os.path.exists(video_filename):
                                            os.remove(video_filename)
                                    elif recording: # fall_duration >= MIN_FALL_RECORDING_DURATION_SEC
                                        print(f"Fall duration {fall_duration:.2f}s. Saving video: {video_filename}")
                                        fall_video_writer.release()

                                    fall_video_writer = None # Reset writer
                                    fall_start_time = None
                                    recording = False
                                    video_filename = None

                            mp_drawing.draw_landmarks(
                                image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                LANDMARK_DRAWING_SPEC, CONNECTION_DRAWING_SPEC
                            )
                            cv2.rectangle(image, (int(x_min), int(y_min)), (int(x_max), int(y_max)), BBOX_COLOR, 2)

                    cv2.putText(image, label, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, TEXT_COLOR, 2, cv2.LINE_AA)

                    ret, buffer = cv2.imencode('.jpg', image)
                    if not ret:
                        print("Failed to encode frame to JPEG.")
                        continue

                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    except Exception as e:
        print(f"An error occurred in gen_frames: {e}")
    finally:
        if cap.isOpened():
            cap.release()
        if fall_video_writer is not None: # If loop exited mid-recording
            print(f"Releasing video writer for {video_filename} due to generator exit.")
            fall_video_writer.release()
        print(f"Fall detection log potentially saved to: {log_path}")
        print("gen_frames finished.")


def get_fall_status(request: HttpRequest) -> JsonResponse:
    """
    Retrieves the current fall detection status from the Django cache.

    Args:
        request: The HttpRequest object.

    Returns:
        A JsonResponse containing a boolean 'fall_detected' status.
    """
    fall_detected_cached_value = cache.get('fall_detected', False) # Default to False if not in cache
    return JsonResponse({'fall_detected': bool(fall_detected_cached_value)})


def camera_feed(request: HttpRequest) -> StreamingHttpResponse:
    """
    Provides a streaming HTTP response of video frames from the camera feed,
    generated by the gen_frames function.

    Args:
        request: The HttpRequest object.

    Returns:
        A StreamingHttpResponse that streams multipart/x-mixed-replace content.
    """
    return StreamingHttpResponse(gen_frames(), content_type='multipart/x-mixed-replace; boundary=frame')
