from django.urls import URLPattern, path
from . import views

urlpatterns = [
    path('camera_page/',views.get_camera_page, name="camera_page"),
    path('camera_feed/', views.camera_feed, name='camera_feed'),
]