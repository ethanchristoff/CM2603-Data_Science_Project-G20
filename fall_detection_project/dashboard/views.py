from django.shortcuts import render
from django.http import JsonResponse
from .acc_gyro_component import latest_sensor_data
# Create your views here.

def dashboard(request):
    return render(request, "dashboard.html")

def get_sensor_data(request):
    """API endpoint for getting latest sensor data (for initial load)"""
    data = latest_sensor_data.copy()
    
    # Add calculated values
    data['heart_rate'] = calculate_heart_rate(data)
    data['spo2'] = calculate_spo2(data)
    data['movement_level'] = calculate_movement_level(data)
    
    return JsonResponse(data)

# Import the calculation functions from consumers.py
from .consumers import calculate_heart_rate, calculate_spo2, calculate_movement_level