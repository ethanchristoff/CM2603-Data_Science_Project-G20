from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('weekly-report/', views.weekly_report, name='weekly-report'),
    path('api/sensor_data/', views.get_sensor_data, name='get_sensor_data'),
]