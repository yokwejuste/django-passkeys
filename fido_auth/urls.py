from django.urls import path

from .views import login_view, register_passkey, logout_view, index, create_user_account

urlpatterns = [
    path('', index, name='index'),
    path('login/', login_view, name='login'),
    path('register-passkey/', register_passkey, name='register_passkey'),
    path('logout/', logout_view, name='logout'),
    path("register/", create_user_account, name="register_user"),
]
