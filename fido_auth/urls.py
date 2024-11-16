from django.urls import path

from .views import login_view, register_passkey, logout_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('register-passkey/', register_passkey, name='register_passkey'),
    path('logout/', logout_view, name='logout'),
]
