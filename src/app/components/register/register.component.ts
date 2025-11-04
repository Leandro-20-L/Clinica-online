import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  rolSeleccionado: string | null = null;
  especialidades = ['Cardiología', 'Pediatría', 'Dermatología', 'Neurología'];
  imagenes: File[] = [];

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
      edad: ['', [Validators.required, Validators.min(18)]],
      dni: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      obraSocial: [''],
      especialidad: [''],
      nuevaEspecialidad: ['']
    });
  }

  seleccionarRol(rol: string) {
    this.rolSeleccionado = rol;
  }

  cancelarRol() {
    this.rolSeleccionado = null;
    this.registerForm.reset();
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) this.imagenes[index - 1] = file;
  }

  async onRegister() {
  if (!this.registerForm.valid || !this.rolSeleccionado) {
    Swal.fire('Error', 'Debe completar todos los campos requeridos', 'error');
    return;
  }

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
      if (this.imagenes.length < 2) {
        Swal.fire('Error', 'Debe seleccionar 2 imágenes para registrarse como paciente.', 'error');
        return;
      }
      imagen1 = await this.usuariosService.subirFoto(`pacientes/${uid}-1.png`, this.imagenes[0]);
      imagen2 = await this.usuariosService.subirFoto(`pacientes/${uid}-2.png`, this.imagenes[1]);
    }


    if (this.rolSeleccionado === 'especialista') {
      if (this.imagenes.length < 1) {
        Swal.fire('Error', 'Debe seleccionar 1 imagen para registrarse como especialista.', 'error');
        return;
      }
      imagen1 = await this.usuariosService.subirFoto(`especialistas/${uid}-perfil.png`, this.imagenes[0]);
    }

   
    const nuevoUsuario = {
      uid: uid,
      nombre: data.nombre,
      apellido: data.apellido,
      edad: data.edad,
      dni: data.dni,
      mail: data.mail,
      rol: this.rolSeleccionado,
      obra_social: this.rolSeleccionado === 'paciente' ? data.obraSocial || null : null,
      especialidad: this.rolSeleccionado === 'especialista' ? data.especialidad : null,
      imagen1: imagen1,
      imagen2: imagen2,
      verificado: false,
      habilitado: this.rolSeleccionado === 'paciente', // especialista espera aprobación
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
}
