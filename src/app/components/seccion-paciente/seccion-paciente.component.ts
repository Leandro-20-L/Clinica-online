import { Component } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seccion-paciente',
  imports: [CommonModule],
  templateUrl: './seccion-paciente.component.html',
  styleUrl: './seccion-paciente.component.scss'
})
export class SeccionPacienteComponent {
   pacientes: any[] = [];

  constructor(private usuariosService: UsuariosService, private router: Router) {}

  async ngOnInit() {
    await this.cargarPacientes();
  }

  async cargarPacientes() {
    try {
      this.pacientes = await this.usuariosService.obtenerPorRol('paciente');
    } catch (error: any) {
      console.error('Error al obtener pacientes:', error.message);
    }
  }
    volver() {
    this.router.navigate(['/admin']);
  }
}
