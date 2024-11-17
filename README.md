# Django Passkey Authentication

A Django-based web application that implements traditional authentication (username/password) and passkey authentication using the WebAuthn API. Passkey authentication allows users to securely log in without passwords, using biometric or hardware-based authentication methods.

## Features

- **User Registration and Login**:
  - Traditional username/password registration and login.
  - Integrated Django's built-in authentication system.
- **Passkey Authentication**:
  - Users can register and log in using passkeys, enabling passwordless authentication.
  - Implements the WebAuthn API for secure authentication.
- **Secure Development Practices**:
  - Uses Django's CSRF protection.
  - Ready for deployment with HTTPS support for secure contexts.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Project Structure](#project-structure)
- [License](#license)

---

## Getting Started

This guide will help you set up and run the Django Passkey Authentication project on your local machine.

### Prerequisites

- Python 3.8 or later
- Django 4.0 or later
- Modern web browser that supports WebAuthn (e.g., Chrome, Firefox, Edge)
- HTTPS for secure passkey functionality (required for production)

---

## Installation

### 1. Clone the Repository

```bash
git https://github.com/yokwejuste/django-passkeys.git django-passkey-auth
cd django-passkey-auth
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up the Database

```bash
python manage.py migrate
```

### 5. Create a Superuser

```bash
python manage.py createsuperuser
```

### 6. Run the Development Server

```bash
python manage.py runserver
```

Access the app at `http://localhost:8000`.

---

## Usage

### Register a User

1. Navigate to `/register/`.
2. Fill out the registration form to create a user account.

### Log In

1. Navigate to `/login/`.
2. Enter your username and password to log in.

### Register a Passkey

1. Log in with your username and password.
2. Navigate to `/register-passkey/`.
3. Click "Register Passkey" and follow the prompts to register your passkey.

### Log In with a Passkey

1. Navigate to `/login/`.
2. Click "Login with Passkey" and authenticate using your registered passkey.

---

## Endpoints

```plaintext
/auth/register/         - Register a new user
/auth/login/            - Login with username/password
/auth/logout/           - Log out the current user
/auth/register-passkey/ - Register a passkey for the user
/auth/login/ (POST)     - Log in using passkey authentication
```

---

## Project Structure

```plaintext
django-passkey-auth/
├── auth_app/
│   ├── migrations/
│   ├── templates/
│   │   ├── auth_app/
│   │       ├── home.html
│   │       ├── login.html
│   │       ├── register.html
│   ├── forms.py
│   ├── views.py
│   ├── urls.py
├── fido_auth/
│   ├── migrations/
│   ├── templates/
│   │   ├── fido_auth/
│   │       ├── register_passkey.html
│   │       ├── login.html
│   ├── models.py
│   ├── views.py
│   ├── urls.py
├── passkey_auth_project/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
├── manage.py
├── requirements.txt
├── README.md
```

---

## Notes for Production

1. **Use HTTPS**: Passkey authentication requires a secure context. Use HTTPS for your deployment.
2. **Configure Allowed Hosts**: Set `ALLOWED_HOSTS` in `settings.py` to include your domain.
3. **Secure Cookies**: Ensure CSRF and session cookies are marked as `Secure`.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
