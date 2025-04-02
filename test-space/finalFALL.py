import threading
import time
import queue
import numpy as np
from datetime import datetime
import cv2 as cv
import mediapipe as mp
import pickle
import joblib
import csv
import os
import logging
import atexit

# Buffers for each sensor stream (holds tuples of (timestamp, value))
camera_queue = queue.Queue(maxsize=10)  # Stores last 10 predictions
gyro_queue = queue.Queue(maxsize=10)  # Faster sensor, larger buffer
spo2_queue = queue.Queue(maxsize=5)  # Slowest sensor

# Lock for thread safety
lock = threading.Lock()
stop_event = threading.Event()

# Set up logging for accel/gyro
log_filename = "acc_sensor_predictions1.log"
logger = logging.getLogger()
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.FileHandler(log_filename, mode='w')
    formatter = logging.Formatter('%(asctime)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# ============================ CAMERA PROCESSING ============================

# Load the trained model and scaler for Camera

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

cam_scaler_path = os.path.join(BASE_DIR,"test-space", "static", "models", "camera", "scaler.pkl")
cam_model_path = os.path.join(BASE_DIR,"test-space","static", "models", "camera", "knn_model.pkl")

cam_scaler = joblib.load(cam_scaler_path)
with open(cam_model_path, "rb") as model_file:
    cam_knn_model = pickle.load(model_file)

# MediaPipe Pose Setup
mp_pose = mp.solutions.pose
non_face_indices = list(range(11, 33))

# Initialize Camera log file
cam_log_file = "camera_log.csv"
if not os.path.exists(cam_log_file):
    with open(cam_log_file, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Timestamp", "Prediction"])  # Column headers

def process_camera():
    cap = cv.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Camera not accessible.")
        return

    with mp_pose.Pose(min_detection_confidence=0.3, min_tracking_confidence=0.3) as pose:
        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                print("Failed to capture frame.")
                break

            image = cv.resize(frame, (640, 480))
            image_rgb = cv.cvtColor(image, cv.COLOR_BGR2RGB)
            results = pose.process(image_rgb)

            cam_prediction = 0  # Default: No fall detected
            if results.pose_landmarks:
                height, width, _ = image.shape
                landmarks = results.pose_landmarks.landmark
                filtered_landmarks = [landmarks[i] for i in non_face_indices]

                x_coords = [lm.x * width for lm in filtered_landmarks]
                y_coords = [lm.y * height for lm in filtered_landmarks]
                visibilities = [lm.visibility for lm in filtered_landmarks]
                
                features_input = np.array([
                    np.mean(x_coords), np.mean(y_coords), np.mean(visibilities),
                    max(x_coords) - min(x_coords), max(y_coords) - min(y_coords)
                ])
                features_input_scaled = cam_scaler.transform([features_input])

                cam_prediction = cam_knn_model.predict(features_input_scaled)[0]  # 1 = Fall, 0 = Non-Fall
                label = "Falling" if cam_prediction == 1 else "Not Falling"
                
                # Draw pose landmarks
                mp.solutions.drawing_utils.draw_landmarks(
                    frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                    mp.solutions.drawing_utils.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                    mp.solutions.drawing_utils.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2),
                )
                
                cv.putText(frame, label, (50, 50), cv.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
            with lock:
                if camera_queue.full():
                    camera_queue.get()
                camera_queue.put((timestamp, cam_prediction))
                
                # Append to log file
                with open(cam_log_file, "a", newline="") as file:
                    writer = csv.writer(file)
                    writer.writerow([timestamp, cam_prediction])

            # Show live feed
            cv.imshow("Fall Detection", frame)

            if cv.waitKey(1) & 0xFF == ord('q'):
                stop_event.set()  # Allow graceful exit

    cap.release()
    cv.destroyAllWindows()

# ============================ ACCELEROMETER/GYRO PROCESSING ============================

class SensorSimulation:
    def __init__(self, model_path, scaler_path):
        # Load model and scaler
        with open(model_path, "rb") as model_file:
            self.cnn_model = joblib.load(model_file)
        with open(scaler_path, "rb") as scaler_file:
            self.scaler = joblib.load(scaler_file)

        # Simulation parameters
        self.window_size = 1000
        self.num_features = 6
        self.data_buffer = []

        # Base values and scenarios
        self.base_values = {
            'normal': {
                'trend_range': (25, 35),  # Central range for normal activity
                'noise_level': 2,  # Low noise level
                'smoothness': 0.7,  # High smoothness for natural movement
                'confidence_range': (0.1, 0.3)  # Added confidence range for normal state
            },
            'fall': {
                'movement_range': (-5, 5),
                'confidence_range': (0.8, 1.0)
            }
        }

        # Scenario cycle
        self.scenarios = [
            {'state': 'normal', 'duration': 50},  # Longer normal state
            {'state': 'fall', 'duration': 20},
            {'state': 'normal', 'duration': 50}  # Longer normal state
        ]

        # CSV setup
        self.csv_filename = "acc_sensor_predictions1.csv"
        self._setup_csv()

    def _setup_csv(self):
        file_exists = os.path.isfile(self.csv_filename)
        if not file_exists:
            with open(self.csv_filename, mode="w", newline="") as file:
                writer = csv.writer(file)
                writer.writerow([
                    "Timestamp", "Sensor1_X", "Sensor1_Y", "Sensor1_Z",
                    "Sensor2_X", "Sensor2_Y", "Sensor2_Z",
                    "Prediction", "Confidence", "State"
                ])

    def _generate_smooth_non_fall_data(self):
        """Generate smooth, realistic non-fall sensor data"""
        config = self.base_values['normal']

        # Initialize base trend
        base_trend = np.linspace(
            config['trend_range'][0],
            config['trend_range'][1],
            self.num_features
        )

        # Create data with slight variations and smooth transitions
        data = []
        for i in range(self.num_features):
            # Generate a smooth curve with local variations
            feature_data = np.linspace(base_trend[i] - config['noise_level'],
                                       base_trend[i] + config['noise_level'],
                                       self.window_size)

            # Add some smooth local variations
            smoothness = config['smoothness']
            variation = np.random.normal(0, config['noise_level'], self.window_size)
            variation = np.convolve(variation, np.ones(10) / 10, mode='same')

            feature_data += variation * (1 - smoothness)

            # Ensure data stays within a reasonable range
            feature_data = np.clip(feature_data,
                                   base_trend[i] - 5,
                                   base_trend[i] + 5)

            data.append(feature_data)

        # Transpose to get correct shape
        return np.array(data).T

    def generate_simulated_data(self, state):
        """Generate sensor data based on current state"""
        if state == 'normal':
            # Use the new smooth data generation method for normal state
            data = self._generate_smooth_non_fall_data()
            return data[0]  # Return a single time step across all features
        else:
            # Fall state generation
            state_config = self.base_values.get(state, self.base_values['normal'])
            movement_range = state_config.get('movement_range', (-5, 5))

            # More random distribution for fall state
            data = np.random.uniform(
                low=movement_range[0],
                high=movement_range[1],
                size=(self.num_features,)
            )
            return data

    def _predict_sensor_data(self, sensor_data, current_state):
        """Predict sensor data using loaded model"""
        sensor_scaled = self.scaler.transform(sensor_data)
        sensor_scaled = sensor_scaled.reshape(1, self.window_size, self.num_features)

        prediction = self.cnn_model.predict(sensor_scaled, verbose=0)[0]
        predicted_class = np.argmax(prediction)

        # Adjust confidence based on current state
        state_config = self.base_values.get(current_state, self.base_values['normal'])
        confidence_range = state_config.get('confidence_range', (0.1, 0.3))

        # Use the predicted confidence value
        confidence = prediction[predicted_class]

        return "Fall" if predicted_class == 1 else "Non-Fall", confidence

def process_accel_gyro():
    logger.info("[DEBUG] Gyro thread started.")
    
    # Paths to your model and scaler
    model_path = os.path.join(BASE_DIR,"test-space", "static", "models", "accl_gyro", "cnn_sensor_model.pkl")
    scaler_path= os.path.join(BASE_DIR,"test-space", "static", "models", "accl_gyro", "acc_gyro_scaler.pkl")


    # Create sensor simulation
    simulation = SensorSimulation(model_path, scaler_path)
    
    current_scenario_index = 0
    time_in_current_scenario = 0

    while not stop_event.is_set():
        # Get current scenario
        current_scenario = simulation.scenarios[current_scenario_index]
        current_state = current_scenario['state']

        # Generate sensor data
        new_data = simulation.generate_simulated_data(current_state)
        simulation.data_buffer.append(new_data)

        # Maintain window size
        if len(simulation.data_buffer) > simulation.window_size:
            simulation.data_buffer.pop(0)

        if len(simulation.data_buffer) % 100 == 0:
            logger.info(f"[DEBUG] Buffer filling: {len(simulation.data_buffer)}/{simulation.window_size}")

        # Make prediction when buffer is full
        if len(simulation.data_buffer) == simulation.window_size:
            model_input = np.array(simulation.data_buffer)
            prediction, confidence = simulation._predict_sensor_data(model_input, current_state)

            # Get current timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Log and print prediction
            log_message = f"{timestamp} - Gyro Prediction: {prediction}, Confidence: {confidence:.6f}"
            logger.info(log_message)
            print(log_message)

            # Update gyro queue
            with lock:
                if gyro_queue.full():
                    gyro_queue.get()
                gyro_queue.put((timestamp, 1 if prediction == "Fall" else 0))

            # Append to CSV file
            with open(simulation.csv_filename, mode="a", newline="") as file:
                writer = csv.writer(file)
                writer.writerow(
                    [timestamp] + list(new_data) + [prediction, confidence, current_state]
                )

        # Update scenario timing
        time_in_current_scenario += 1
        if time_in_current_scenario >= current_scenario['duration']:
            # Move to next scenario
            current_scenario_index = (current_scenario_index + 1) % len(simulation.scenarios)
            time_in_current_scenario = 0

        # Small delay to control simulation speed
        time.sleep(0.05)  # Adjust this to control speed

    logger.info("[INFO] Gyro thread stopping...")

# ============================ SPO2 PROCESSING ============================

# Load the trained model and scaler for SpO2
spo2_model_path = os.path.join(BASE_DIR,"test-space", "static", "models", "heart_spo2", "knn_model.pkl")
spo2_scaler_path = os.path.join(BASE_DIR,"test-space", "static", "models", "heart_spo2", "scaler.pkl")

with open(spo2_model_path, 'rb') as model_file:
    spo2_knn_model = pickle.load(model_file)

with open(spo2_scaler_path, 'rb') as scaler_file:
    spo2_scaler = pickle.load(scaler_file)

# Initialize SpO2 log file
spo2_log_file = "spo2_log.csv"
with open(spo2_log_file, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["Timestamp", "HRV", "SpO2", "Prediction"])

# Function to process SpO2 data
def process_spo2():
    while not stop_event.is_set():
        # Simulated Values for sampling and demonstrating, real time data can be inputted here
        HRV = np.random.uniform(40, 100)  
        SpO2 = np.random.uniform(85, 100) 
        input_data = np.array([[HRV, SpO2]])
        
        # Preprocess input data
        input_scaled = spo2_scaler.transform(input_data)
        
        # Make prediction
        spo2_prediction = spo2_knn_model.predict(input_scaled)[0]
        timestamp = datetime.now()

        with lock:
            if spo2_queue.full():
                spo2_queue.get()
            spo2_queue.put((timestamp, spo2_prediction))
        
        # Append to log file
        with open(spo2_log_file, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([timestamp.strftime('%Y-%m-%d %H:%M:%S'), f"{HRV:.2f}", f"{SpO2:.2f}", spo2_prediction])
        
        # Wait before next reading
        time.sleep(1)

# ============================ FUSION ALGORITHM ============================

def fusion_algorithm():
    while not stop_event.is_set():
        with lock:
            cam_pred = (datetime.now(), 0)
            gyro_pred = (datetime.now(), 0)
            spo2_pred = (datetime.now(), 0)
            
            if not camera_queue.empty():
                cam_pred = list(camera_queue.queue)[-1]
            if not gyro_queue.empty():
                gyro_pred = list(gyro_queue.queue)[-1]
            if not spo2_queue.empty():
                spo2_pred = list(spo2_queue.queue)[-1]

        # Extract values
        cam_time, cam_value = cam_pred
        gyro_time, gyro_value = gyro_pred
        spo2_time, spo2_value = spo2_pred

        # Weighted Sum Calculation
        weighted_sum = (4 * int(cam_value)) + (2 * int(gyro_value)) + (1 * int(spo2_value))

        if weighted_sum >= 4:
            final_prediction = "🚨 Fall Detected"
        elif weighted_sum == 3 and cam_value == 0:
            final_prediction = "⚠️ Risk of Falling"
        else:
            final_prediction = "✅ Non-Fall"

        print(f"[{datetime.now().strftime('%H:%M:%S')}] Camera({cam_value}) Gyro({gyro_value}) SpO2({spo2_value}) → Prediction: {final_prediction}")

        time.sleep(0.1)

# ============================ CLEANUP ============================

def cleanup():
    logger.info("[INFO] Shutting down logging and stopping threads...")
    stop_event.set()
    logging.shutdown()

atexit.register(cleanup)

# ============================ MAIN FUNCTION ============================

if __name__ == "__main__":
    try:
        camera_thread = threading.Thread(target=process_camera, daemon=True)
        accel_gyro_thread = threading.Thread(target=process_accel_gyro, daemon=True)
        spo2_thread = threading.Thread(target=process_spo2, daemon=True)
        fusion_thread = threading.Thread(target=fusion_algorithm, daemon=True)

        camera_thread.start()
        accel_gyro_thread.start()
        spo2_thread.start()
        fusion_thread.start()

        print("[INFO] All threads started. Press Ctrl+C to stop.")
        
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[INFO] Stopping all threads...")
        stop_event.set()
        
        time.sleep(2)  
        
        print("[INFO] All threads stopped. Exiting.")