import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import Swal from 'sweetalert2';
import {  RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule,RecaptchaModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  rolSeleccionado: string | null = null;
  especialidades = ['Cardiología', 'Pediatría', 'Dermatología', 'Neurología'];
  imagenes: File[] = [];
  
  imagenesPreview: string[] = [];
   captchaValido = false;
  siteKey = environment.RECAPTCHA_SITE_KEY;

  camposComunes = [
    { label: 'Nombre', type: 'text', control: 'nombre', placeholder: 'Ingrese su nombre' },
    { label: 'Apellido', type: 'text', control: 'apellido', placeholder: 'Ingrese su apellido' },
    { label: 'Edad', type: 'number', control: 'edad', placeholder: 'Ej: 30' },
    { label: 'DNI', type: 'text', control: 'dni', placeholder: 'Ej: 40123123' },
    { label: 'Correo electrónico', type: 'email', control: 'mail', placeholder: 'ejemplo@correo.com' },
    { label: 'Contraseña', type: 'password', control: 'password', placeholder: '********' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService : AuthService,
    private usuariosService : UsuariosService) {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', Validators.required],
      dni: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      obraSocial: [''],
      especialidad: [''],
      nuevaEspecialidad: [''],
      recaptcha: ['', Validators.required]
    });
  }

  seleccionarRol(rol: string) {
    this.rolSeleccionado = rol;

    const edadCtrl = this.registerForm.get('edad');

    if (rol === 'especialista') {
      edadCtrl?.setValidators([Validators.required, Validators.min(18)]);
    } else if (rol === 'paciente') {
      edadCtrl?.setValidators([Validators.required]); 
    }

    edadCtrl?.updateValueAndValidity();
  }

  cancelarRol() {
    this.rolSeleccionado = null;
    this.registerForm.reset();
    this.imagenes = [];
    this.imagenesPreview = [];
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.imagenes[index - 1] = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenesPreview[index - 1] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onCaptchaResolved(token: string | null): void {
    
    this.registerForm.get('recaptcha')?.setValue(token);
  }

  async onRegister() {
    if (!this.puedeRegistrarse()) return; 

    const data = { ...this.registerForm.value };

    if (data.especialidad === 'otra' && data.nuevaEspecialidad) {
      data.especialidad = data.nuevaEspecialidad.trim();
      if (!this.especialidades.includes(data.especialidad)) {
        this.especialidades.push(data.especialidad);
      }
    }

    try {
      const { data: authData, error } = await this.authService.signUp(data.mail, data.password);
      if (error) throw error;

      const uid = authData.user?.id;
      if (!uid) throw new Error('No se pudo obtener el UID del usuario.');

      let imagen1: string | null = null;
      let imagen2: string | null = null;

      if (this.rolSeleccionado === 'paciente') {
        imagen1 = await this.usuariosService.subirFoto(`pacientes/${uid}-1.png`, this.imagenes[0]);
        imagen2 = await this.usuariosService.subirFoto(`pacientes/${uid}-2.png`, this.imagenes[1]);
      }

      if (this.rolSeleccionado === 'especialista') {
        imagen1 = await this.usuariosService.subirFoto(`especialistas/${uid}-perfil.png`, this.imagenes[0]);
      }

      const nuevoUsuario = {
        uid,
        nombre: data.nombre,
        apellido: data.apellido,
        edad: data.edad,
        dni: data.dni,
        mail: data.mail,
        rol: this.rolSeleccionado,
        obra_social: this.rolSeleccionado === 'paciente' ? data.obraSocial || null : null,
        especialidad: this.rolSeleccionado === 'especialista' ? data.especialidad : null,
        imagen1,
        imagen2,
        verificado: false,
        habilitado: this.rolSeleccionado === 'paciente',
      };

      await this.usuariosService.insertar(nuevoUsuario);

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text:
          this.rolSeleccionado === 'especialista'
            ? 'Su cuenta fue registrada. Espere la aprobación del administrador.'
            : 'Se ha enviado un correo de verificación a su email.',
        confirmButtonText: 'Aceptar',
      });

      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Error en el registro:', error);
      Swal.fire('Error', error.message || 'No se pudo registrar el usuario.', 'error');
    }
}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  puedeRegistrarse(): boolean {
  
  if (!this.rolSeleccionado || this.registerForm.invalid) return false;

 
  if (!this.registerForm.get('recaptcha')?.value) return false;

  
  if (this.rolSeleccionado === 'paciente' && this.imagenes.length < 2) return false;
  if (this.rolSeleccionado === 'especialista' && this.imagenes.length < 1) return false;

  return true; 
}
}
