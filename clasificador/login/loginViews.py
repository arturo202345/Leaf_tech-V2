from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.shortcuts import redirect, render
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(label="Nombre", required=False)
    last_name = forms.CharField(label="Apellido", required=False)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")

def signup(request):
    if request.method == 'GET':
        return render(request, 'clasificador/login/signup.html', {
            'form': CustomUserCreationForm()
        })
    else:
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            try:
                user = form.save()
                login(request, user)
                return redirect('index')
            except IntegrityError:
                return render(request, 'clasificador/login/signup.html', {
                    'form': form,
                    'error': 'El nombre de usuario ya está en uso.'
                })
        else:
            return render(request, 'clasificador/login/signup.html', {
                'form': form,
                'error': 'Por favor corrige los errores del formulario.'
            })

def signin(request):
    if request.method == "GET":
        return render(request, 'clasificador/login/signin.html', {
            'form': AuthenticationForm()
        })
    else:
        user = authenticate(
            request,
            username=request.POST['username'],
            password=request.POST['password']
        )
        if user is None:
            return render(request, 'clasificador/login/signin.html', {
                'form': AuthenticationForm(),
                'error': 'El nombre de usuario o la contraseña son incorrectos.'
            })
        else:
            login(request, user)
            return redirect('index')

def signout(request):
    logout(request)
    return redirect('index')