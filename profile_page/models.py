from django.db import models

from django.db import models
from django.contrib.auth.models import User

class FallHistory(models.Model):
    FALL_COUNT_CHOICES = [
        ('None', 'None'),
        ('1 fall', '1 fall'),
        ('2 falls', '2 falls'),
        ('3+ falls', '3+ falls'),
    ]
    
    INJURY_CHOICES = [
        ('None', 'None'),
        ('Minor', 'Minor (bruises)'),
        ('Moderate', 'Moderate (sprains)'),
        ('Severe', 'Severe (fractures)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    previous_falls = models.CharField(max_length=10, choices=FALL_COUNT_CHOICES, default='None')
    fall_injury = models.CharField(max_length=10, choices=INJURY_CHOICES, default='None')
    fall_circumstances = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.previous_falls}"


class HomeEnvironment(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    loose_rugs = models.BooleanField(default=False)
    clutter = models.BooleanField(default=False)
    stairs_without_railings = models.BooleanField(default=False)
    poor_lighting = models.BooleanField(default=False)
    bathroom_without_grab_bars = models.BooleanField(default=False)
    slippery_floors = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - Home Environment"


class AdditionalInformation(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    additional_info = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - Additional Information"


class SystemConfiguration(models.Model):
    SENSITIVITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    NOTIFICATION_CHOICES = [
        ('Emergency Contact Only', 'Emergency Contact Only'),
        ('Emergency Contact + Care Provider', 'Emergency Contact + Care Provider'),
        ('Emergency Services Immediately', 'Emergency Services Immediately'),
    ]

    MONITORING_CHOICES = [
        ('Daytime Only (7AM-10PM)', 'Daytime Only (7AM-10PM)'),
        ('Nighttime Only (10PM-7AM)', 'Nighttime Only (10PM-7AM)'),
        ('24/7 Monitoring', '24/7 Monitoring'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    sensitivity_level = models.CharField(max_length=10, choices=SENSITIVITY_CHOICES, default='Medium')
    notification_preference = models.CharField(max_length=50, choices=NOTIFICATION_CHOICES, default='Emergency Contact + Care Provider')
    confirmation_time = models.PositiveIntegerField(default=30)  # Time in seconds
    monitoring_schedule = models.CharField(max_length=30, choices=MONITORING_CHOICES, default='24/7 Monitoring')

    def __str__(self):
        return f"{self.user.username} - System Configuration"
