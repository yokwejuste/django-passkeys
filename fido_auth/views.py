import base64
import json
import os

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from passkeys.models import UserPasskey

@login_required
def register_passkey(request):
    if request.method == 'POST':
        challenge = os.urandom(32)
        challenge_b64 = base64.b64encode(challenge).decode('utf-8')

        user_id_b64 = base64.b64encode(request.user.pk.to_bytes(4, 'big')).decode('utf-8')

        return JsonResponse({
            'challenge': challenge_b64,
            'rp': {'name': settings.FIDO_SERVER_NAME, 'id': 'localhost'},
            'user': {
                'id': user_id_b64,
                'name': request.user.username,
                'displayName': request.user.get_full_name() or request.user.username,
            },
            'pubKeyCredParams': [{'type': 'public-key', 'alg': -7}],
        })

    elif request.method == 'PUT':
        credential_data = json.loads(request.body)
        raw_id = credential_data['rawId']
        credential_id = base64.b64encode(base64.b64decode(raw_id)).decode('utf-8')

        UserPasskey.objects.create(user=request.user, credential_id=credential_id)
        return JsonResponse({'status': 'success'})

    return render(request, 'register_passkey.html')


@csrf_exempt
def login_view(request):
    if request.method == 'POST' and request.headers.get('Content-Type') == 'application/json':
        data = json.loads(request.body)

        if data.get("request_type") == "webauthn":
            challenge = os.urandom(32)
            request.session['webauthn_challenge'] = base64.b64encode(challenge).decode('utf-8')

            passkey_credentials = UserPasskey.objects.values_list('credential_id', flat=True)
            allow_credentials = [{'id': base64.b64encode(cred_id).decode('utf-8'), 'type': 'public-key'}
                                 for cred_id in passkey_credentials]

            return JsonResponse({
                'challenge': {
                    'challenge': request.session['webauthn_challenge'],
                    'allowCredentials': allow_credentials,
                }
            })

        elif data.get("response"):
            response = data["response"]
            credential_id = base64.b64decode(response['id'])
            user_passkey = UserPasskey.objects.get(credential_id=credential_id)
            user = user_passkey.user

            login(request, user)
            return JsonResponse({"status": "Logged in with passkey!"})

    username = request.POST.get('username')
    password = request.POST.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return HttpResponse("Logged in!")
    else:
        return render(request, 'login.html')


@login_required
def logout_view(request):
    """
    Log the user out and redirect to the login page.
    """
    logout(request)
    messages.success(request, "Successfully logged out!")
    return HttpResponse("Logged out!")
