from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('passkeys/', include('passkeys.urls')),
    path('', include('fido_auth.urls')),
]
