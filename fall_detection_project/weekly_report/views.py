from django.shortcuts import render

def weekly_report(request):
    return render(request, "weekly-report.html")

def profile(request):
    return render(request, "profile.html")