import os
import subprocess
import threading

import psutil
from django.shortcuts import render

PID_FILE = "process.pid"

def run_background_task():
    if os.path.exists(PID_FILE):
        with open(PID_FILE) as f:
            try:
                pid = int(f.read().strip())
                if psutil.pid_exists(pid):
                    print(f"Process is already running with PID: {pid}")
                    return
                else:
                    os.remove(PID_FILE)
            except ValueError:
                os.remove(PID_FILE)

    process = subprocess.Popen(["python", "dashboard/dashboard_functions_bg.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    with open(PID_FILE, "w") as f:
        f.write(str(process.pid))

    print(f"Process started with PID: {process.pid}")

def dashboard(request):
    thread = threading.Thread(target=run_background_task, daemon=True)
    thread.start()

    return render(request, "dashboard.html")
