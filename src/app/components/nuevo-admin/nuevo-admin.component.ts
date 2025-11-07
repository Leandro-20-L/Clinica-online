import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nuevo-admin',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './nuevo-admin.component.html',
  styleUrl: './nuevo-admin.component.scss'
})
export class NuevoAdminComponent {
  form: FormGroup;
  imagen: File | null = null;
  imagenPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private usuariosService: UsuariosService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18)]],
      dni: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagen = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagenPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async crearAdmin() {
    if (this.form.invalid || !this.imagen) {
      Swal.fire('Error', 'Debe completar todos los campos y subir una imagen.', 'error');
      return;
    }

    try {
      const data = this.form.value;
      const { data: authData, error } = await this.authService.signUp(data.mail, data.password);
      if (error) throw error;

      const uid = authData.user?.id;
      if (!uid) throw new Error('No se pudo obtener UID del usuario.');

      const imagenUrl = await this.usuariosService.subirFoto(`admins/${uid}-perfil.png`, this.imagen);

      const nuevoAdmin = {
        uid,
        nombre: data.nombre,
        apellido: data.apellido,
        edad: data.edad,
        dni: data.dni,
        mail: data.mail,
        rol: 'admin',
        imagen1: imagenUrl,
        habilitado: true,
        verificado: true
      };

      await this.usuariosService.insertar(nuevoAdmin);

      Swal.fire('Éxito', 'Administrador creado correctamente.', 'success');
      this.router.navigate(['/admin']);
    } catch (error: any) {
      Swal.fire('Error', error.message || 'No se pudo registrar el administrador.', 'error');
    }
  }

  volver() {
    this.router.navigate(['/admin']);
  }
}
