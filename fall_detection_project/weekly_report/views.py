from django.shortcuts import render

def weekly_report(request):
    return render(request, "weekly-report.html")