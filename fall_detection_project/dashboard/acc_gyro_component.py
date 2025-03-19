import serial
import numpy as np
import joblib
import time
import json
from threading import Thread
from django.http import JsonResponse
from django.conf import settings
import os

# Global variables to store latest sensor data
latest_sensor_data = {
    'accelerometer': {'x': 0, 'y': 0, 'z': 0},
    'gyroscope': {'x': 0, 'y': 0, 'z': 0},
    'fall_detected': False,
    'timestamp': time.time()
}

class AccGyroComponent:
    def __init__(self, serial_port='/dev/ttyACM0', baud_rate=9600):
        """Initialize the fall detection system"""
        self.serial_port = serial_port
        self.baud_rate = baud_rate
        self.serial_connection = None
        self.is_running = False
        
        # Load the trained model and scaler (match the names from your training code)
        model_dir = os.path.join(settings.BASE_DIR, 'dashboard', 'static', 'ml_models')
        scaler_path = os.path.join(model_dir, 'acc_gyro_scaler.pkl')
        model_path = os.path.join(model_dir, 'cnn_sensor_model.pkl')

        self.model = joblib.load(scaler_path)
        self.scaler = joblib.load(model_path)
        
        # Time frame parameters
        self.segment_length = 1000  # 5 seconds at 200Hz
        self.current_frame = []
        self.sensor_columns = ['x_ADXL345', 'y_ADXL345', 'z_ADXL345',
                              'x_ITG3200', 'y_ITG3200', 'z_ITG3200']
        
    def connect_to_arduino(self):
        """Establish connection with Arduino"""
        try:
            self.serial_connection = serial.Serial(self.serial_port, self.baud_rate)
            print(f"Connected to Arduino on {self.serial_port}")
            return True
        except Exception as e:
            print(f"Failed to connect to Arduino: {e}")
            return False
    
    def read_sensor_data(self):
        """Read a single data point from the sensors"""
        if not self.serial_connection:
            return None
        
        try:
            # Read line from Arduino (format expected: "ax,ay,az,gx,gy,gz")
            line = self.serial_connection.readline().decode('utf-8').strip()
            values = list(map(float, line.split(',')))
            
            if len(values) == 6:
                # Map values to the same column names used in training
                sensor_data = {
                    'accelerometer': {'x': values[0], 'y': values[1], 'z': values[2]},
                    'gyroscope': {'x': values[3], 'y': values[4], 'z': values[5]},
                    'raw_values': values,  # Store raw values for easier processing
                    'timestamp': time.time()
                }
                return sensor_data
            else:
                print("Invalid data format received from Arduino")
                return None
        except Exception as e:
            print(f"Error reading sensor data: {e}")
            return None
    
    def process_time_frame(self, frame):
        """Process a complete time frame and detect falls"""
        if len(frame) < self.segment_length:
            # Pad frame if needed (in case of dropped readings)
            padding = self.segment_length - len(frame)
            frame = frame + [frame[-1]] * padding
        elif len(frame) > self.segment_length:
            # Trim to exact size if we have more data than needed
            frame = frame[:self.segment_length]
        
        # Extract raw values from each data point in the frame
        # This creates a 2D array of shape (segment_length, 6)
        frame_array = np.array([data_point['raw_values'] for data_point in frame])
        
        # Reshape to the expected 3D format: (1, segment_length, 6)
        # This represents 1 sample, with segment_length time steps, and 6 features
        X = frame_array.reshape(1, self.segment_length, 6)
        
        # Apply the same scaling as in training
        # Reshape to 2D for scaling: (segment_length*1, 6)
        X_reshaped = X.reshape(-1, X.shape[-1])
        
        # Scale the data
        X_scaled = self.scaler.transform(X_reshaped)
        
        # Reshape back to 3D: (1, segment_length, 6)
        X_scaled = X_scaled.reshape(X.shape)
        
        # Make prediction
        prediction = self.model.predict(X_scaled)[0]
        
        # Update global variable with fall detection status
        global latest_sensor_data
        latest_sensor_data['fall_detected'] = bool(prediction)
        
        return bool(prediction)
    
    def start_monitoring(self):
        """Start continuous monitoring for falls"""
        if not self.connect_to_arduino():
            return False
        
        self.is_running = True
        self.current_frame = []
        
        print("Starting fall detection monitoring...")
        
        while self.is_running:
            # Read sensor data
            sensor_data = self.read_sensor_data()
            
            if sensor_data:
                # Update global variable with latest reading
                global latest_sensor_data
                latest_sensor_data['accelerometer'] = sensor_data['accelerometer']
                latest_sensor_data['gyroscope'] = sensor_data['gyroscope']
                latest_sensor_data['timestamp'] = sensor_data['timestamp']
                
                # Add to current frame
                self.current_frame.append(sensor_data)
                
                # Check if we have a complete frame
                if len(self.current_frame) >= self.segment_length:
                    # Process the frame
                    fall_detected = self.process_time_frame(self.current_frame)
                    
                    if fall_detected:
                        print("FALL DETECTED!")
                        # Additional actions on fall detection could go here
                    
                    # Keep the most recent half of the data for the next frame
                    # This creates overlapping frames, which can improve detection
                    self.current_frame = self.current_frame[self.segment_length//2:]
        
        # Close connection when done
        if self.serial_connection:
            self.serial_connection.close()
    
    def stop_monitoring(self):
        """Stop the monitoring process"""
        self.is_running = False

# Django view to get latest sensor data
def get_sensor_data(request):
    """Django view to return the latest sensor data as JSON"""
    global latest_sensor_data
    return JsonResponse(latest_sensor_data)

# Function to handle real-time data visualization for Django
def handle_websocket(websocket):
    """Send real-time sensor data over websocket connection"""
    global latest_sensor_data
    while True:
        # Send the latest sensor data as JSON
        websocket.send(json.dumps(latest_sensor_data))
        time.sleep(0.05)  # Send updates at 20Hz

# Start monitoring in a separate thread when Django server starts
fall_detector = AccGyroComponent()
monitoring_thread = Thread(target=fall_detector.start_monitoring)
monitoring_thread.daemon = True  # Thread will exit when main program exits
monitoring_thread.start()

# Example usage (not part of Django) for testing
if __name__ == "__main__":
    fall_detector = AccGyroComponent()
    try:
        fall_detector.start_monitoring()
    except KeyboardInterrupt:
        fall_detector.stop_monitoring()
        print("Monitoring stopped")

# At the end of the file - thread initialization
def start_fall_detection():
    fall_detector = AccGyroComponent()
    monitoring_thread = Thread(target=fall_detector.start_monitoring)
    monitoring_thread.daemon = True
    monitoring_thread.start()