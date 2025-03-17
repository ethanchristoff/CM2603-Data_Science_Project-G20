from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/sensor_data/', views.get_sensor_data, name='get_sensor_data'),
]