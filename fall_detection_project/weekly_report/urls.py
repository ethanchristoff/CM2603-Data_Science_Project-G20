from django.urls import path
from . import views

urlpatterns = [
    path('', views.weekly_report, name='weekly-report')
]