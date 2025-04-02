import thread_controller

print("Stopping background thread...")
thread_controller.stop_event.set()  
print("Background thread should stop soon.")