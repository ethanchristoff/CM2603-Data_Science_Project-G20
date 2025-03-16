from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

urlpatterns = [
    path('',views.get_camera_page, name="camera_page"),
    path('camera_feed/', views.camera_feed, name='camera_feed'),
    path('get_fall_status/', views.get_fall_status, name='get_fall_status'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)