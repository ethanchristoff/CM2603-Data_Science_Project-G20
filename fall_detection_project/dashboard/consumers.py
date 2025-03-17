import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import asyncio
from .acc_gyro_component import latest_sensor_data

class SensorDataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.send_task = asyncio.create_task(self.send_sensor_data())
    
    async def disconnect(self, close_code):
        self.send_task.cancel()
    
    async def send_sensor_data(self):
        try:
            while True:
                # Add calculated movement level
                data = latest_sensor_data.copy()
                
                # Calculate heart rate (simulated for now)
                # In a real system, you would process heart rate sensor data here
                data['heart_rate'] = calculate_heart_rate(data)
                
                # Calculate SpO2 (simulated for now)
                # In a real system, you would process SpO2 sensor data here
                data['spo2'] = calculate_spo2(data)
                
                # Calculate overall movement level
                data['movement_level'] = calculate_movement_level(data)
                
                await self.send(text_data=json.dumps(data))
                await asyncio.sleep(0.2)  # Update at 5Hz
        except asyncio.CancelledError:
            pass

def calculate_heart_rate(data):
    # This is a placeholder - replace with actual heart rate calculation
    # In a real system, you would process heart rate sensor data
    # For now, we'll use accelerometer magnitude to simulate activity-based heart rate
    accel = data['accelerometer']
    accel_magnitude = (accel['x']**2 + accel['y']**2 + accel['z']**2)**0.5
    
    # Map accelerometer magnitude to heart rate range (60-100 bpm)
    # More movement = higher heart rate
    heart_rate = 60 + min(40, accel_magnitude * 2)
    return round(heart_rate)

def calculate_spo2(data):
    # This is a placeholder - replace with actual SpO2 calculation
    # In a real system, you would process SpO2 sensor data
    # For now, return a normal value with small variations
    import random
    return round(97 + random.uniform(-1, 1), 1)

def calculate_movement_level(data):
    # Calculate a single movement level from accelerometer and gyroscope data
    accel = data['accelerometer']
    gyro = data['gyroscope']
    
    # Calculate magnitudes
    accel_magnitude = (accel['x']**2 + accel['y']**2 + accel['z']**2)**0.5
    gyro_magnitude = (gyro['x']**2 + gyro['y']**2 + gyro['z']**2)**0.5
    
    # Normalize to 0-100 scale (adjust these parameters based on your sensor values)
    accel_normalized = min(100, max(0, accel_magnitude * 10))
    gyro_normalized = min(100, max(0, gyro_magnitude * 5))
    
    # Combined movement level (adjust weights based on importance)
    movement_level = (accel_normalized * 0.7) + (gyro_normalized * 0.3)
    
    return round(movement_level)