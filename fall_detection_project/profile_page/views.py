from django.shortcuts import render


def load_profile(request):
    return render(request, "profile_page.html")
