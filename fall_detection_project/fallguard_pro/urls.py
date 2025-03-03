from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

urlpatterns = [
    path('camera_page/',views.get_camera_page, name="camera_page"),
    path('camera_feed/', views.camera_feed, name='camera_feed'),# Debugging page for the camera feed
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)