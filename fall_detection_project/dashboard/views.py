import subprocess
from django.shortcuts import render

def dashboard(request):
    subprocess.run(["python", "bg_task.py"])
    return render(request, "dashboard.html")