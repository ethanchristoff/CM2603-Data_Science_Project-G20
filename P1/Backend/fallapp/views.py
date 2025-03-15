from django.shortcuts import render, HttpResponse
from .models import ToDoItem

# Create your views here.
def weekly_report(request):
    # return HttpResponse("Hello, world. You're at the polls page.")
    return render(request, 'weekly-report.html')

# def todos(request):
#     items = ToDoItem.objects.all()
#     return render(request, "todos.html", {'todos': items})