from django.apps import AppConfig


class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.ml_models.BigAutoField'
    name = 'main'

    def ready(self):
        # Start the fall detection thread when Django starts
        import main.acc_gyro_component
        main.acc_gyro_component.start_fall_detection()