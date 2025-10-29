import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Datos enviados:', this.loginForm.value);
      // acá iría la lógica real de autenticación
    }
  }

  autocompletar(tipo: string) {
    if (tipo === 'paciente') {
      this.loginForm.setValue({ email: 'paciente@clinica.com', password: '123456' });
    } else if (tipo === 'especialista') {
      this.loginForm.setValue({ email: 'especialista@clinica.com', password: '123456' });
    } else if (tipo === 'admin') {
      this.loginForm.setValue({ email: 'admin@clinica.com', password: '123456' });
    }
  }

   goToRegister() {
    this.router.navigate(['/register']);
  }
}
