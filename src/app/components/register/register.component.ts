import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import Swal from 'sweetalert2';
import {  RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environments';
import { LoadingService } from '../../services/loading.service';

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
    private usuariosService : UsuariosService,
  private loadingService: LoadingService) {
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
      especialidades: [[]],
       nuevasEspecialidades: [''],   
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
     this.loadingService.mostrarSpinner();

    const data = { ...this.registerForm.value };

    // normaliza especialidades seleccionadas
    let especialidadesSeleccionadas: string[] = Array.isArray(data.especialidades)
  ? [...data.especialidades]
  : [];

// --- Si escribió nuevas especialidades separadas por coma ---
if (data.nuevasEspecialidades && data.nuevasEspecialidades.trim() !== '') {
  const nuevas = data.nuevasEspecialidades
    .split(',') // separa por coma
    .map((e: string) => e.trim()) // quita espacios
    .filter((e: string) => e !== ''); // evita vacíos

  // agrega las nuevas evitando duplicados
  for (const esp of nuevas) {
    if (!especialidadesSeleccionadas.includes(esp)) {
      especialidadesSeleccionadas.push(esp);
    }

    
    if (!this.especialidades.includes(esp)) {
      this.especialidades.push(esp);
    }
  }
}

    try {
     
      const { data: authData, error } = await this.authService.signUp(data.mail, data.password);

      if (error) {

    if (
      error.message.includes("already registered") || 
      error.message.includes("User already registered") ||
      error.message.toLowerCase().includes("email")
    ) {
      this.loadingService.ocultarSpinner();
      Swal.fire({
        icon: 'error',
        title: 'Email ya registrado',
        text: 'El correo ingresado ya existe en el sistema.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    throw error;
  }
      if (error) throw error;

      const uid = authData.user?.id;
      if (!uid) throw new Error('No se pudo obtener el UID del usuario.');

      
      let imagen1: string | null = null;
      let imagen2: string | null = null;

      if (this.rolSeleccionado === 'paciente') {
        imagen1 = await this.usuariosService.subirFoto(`pacientes/${uid}-1.png`, this.imagenes[0]);
        imagen2 = await this.usuariosService.subirFoto(`pacientes/${uid}-2.png`, this.imagenes[1]);
      } else {
        imagen1 = await this.usuariosService.subirFoto(`especialistas/${uid}-perfil.png`, this.imagenes[0]);
      }

      //  insertar usuario en tabla "usuarios"
      const nuevoUsuario = {
        uid,
        nombre: data.nombre,
        apellido: data.apellido,
        edad: data.edad,
        dni: data.dni,
        mail: data.mail,
        rol: this.rolSeleccionado,
        obra_social: this.rolSeleccionado === 'paciente' ? (data.obraSocial || null) : null,
        
        imagen1,
        imagen2,
        verificado: false,
        habilitado: this.rolSeleccionado === 'paciente'
      };

      const { data: insertRows } = await this.usuariosService.insertar(nuevoUsuario); // tiene que taer .select()
      const idUsuario = Array.isArray(insertRows) ? insertRows[0]?.id : (insertRows as any)?.id;

      
      if (this.rolSeleccionado === 'especialista' && idUsuario) {
        for (const esp of especialidadesSeleccionadas) {
          await this.usuariosService.agregarEspecialidad(idUsuario, esp);
        }
      }

      
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text:
          this.rolSeleccionado === 'especialista'
            ? 'Se ha enviado un correo de verificación a su email.'
            : 'Se ha enviado un correo de verificación a su email.',
        confirmButtonText: 'Aceptar'
      });

      this.router.navigate(['/login']);
    } catch (err: any) {
       this.loadingService.ocultarSpinner();

  
  if (err.message && err.message.includes("usuarios_mail_key")) {
    Swal.fire({
      icon: "error",
      title: "Email ya registrado",
      text: "El correo ingresado ya existe",
      confirmButtonText: "Aceptar"
    });
    return;
  }
      console.error('Error en el registro:', err);
      Swal.fire('Error', err.message || 'No se pudo registrar el usuario.', 'error');

      this.loadingService.ocultarSpinner();

    }finally {
   
    this.loadingService.ocultarSpinner();
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
