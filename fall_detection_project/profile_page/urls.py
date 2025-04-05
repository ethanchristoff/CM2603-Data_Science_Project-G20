from django.urls import path
from . import views

urlpatterns = [
    path('', views.load_profile, name='profile_page'),
]