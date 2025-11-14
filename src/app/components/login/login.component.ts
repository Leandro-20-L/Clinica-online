import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { LoadingService } from '../../services/loading.service';


@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
    email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private snackBar: MatSnackBar, 
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private loadingService : LoadingService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onLogin() {
     if (!this.loginForm.valid) return;
     this.loadingService.mostrarSpinner();

  const { email, password } = this.loginForm.value;

  try {
    const user = await this.authService.logIn(email, password);
    const verified = await this.authService.isEmailVerified(); 

   
    const usuario = await this.usuariosService.obtenerPorUID(user.id);
    if (verified && !usuario.verificado) {
      await this.usuariosService.actualizar(user.id, { verificado: true });
      usuario.verificado = true; 
    }

   
    if (!usuario.verificado) {
      this.snackBar.open('Debe verificar su correo antes de ingresar.', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      await this.authService.logOut();
      return;
    }

    if (usuario.rol === 'especialista' && !usuario.habilitado) {
      this.snackBar.open('Su cuenta aún no fue aprobada por el administrador.', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }


   
    this.snackBar.open(`Bienvenido ${usuario.nombre}`, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });

    switch (usuario.rol) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'especialista':
        this.router.navigate(['/especialista']);
        break;
      case 'paciente':
        this.router.navigate(['/paciente']);
        break;
    }

  } catch (error: any) {
    this.snackBar.open(error.message || 'Correo o contraseña incorrectos', 'Cerrar', {
      duration: 3500,
      panelClass: ['snackbar-error'],
    });
  }finally{
    this.loadingService.ocultarSpinner();
  }
  }

  llenarUsers(email:string,password:string){
  this.loginForm.patchValue({
    email: email,
    password: password
  });
  }

   goToRegister() {
    this.router.navigate(['/register']);
  }

  
}
