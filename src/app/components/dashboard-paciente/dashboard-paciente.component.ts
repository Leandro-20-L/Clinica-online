import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-paciente',
  imports: [CommonModule],
  templateUrl: './dashboard-paciente.component.html',
  styleUrl: './dashboard-paciente.component.scss'
})
export class DashboardPacienteComponent {
  paciente: any = null;
  turnos: any[] = [];

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  async ngOnInit() {
    const uid = await this.authService.getUserUid();
    this.paciente = await this.usuariosService.obtenerPorUID(uid!);
    
    this.turnos = [];
  }

  //nose
  abrirPerfil() {
    Swal.fire({
      title: 'Mi Perfil',
      html: `
        <strong>Nombre:</strong> ${this.paciente.nombre}<br>
        <strong>Apellido:</strong> ${this.paciente.apellido}<br>
        <strong>Correo:</strong> ${this.paciente.mail}<br>
        <strong>Obra Social:</strong> ${this.paciente.obra_social || 'N/A'}
      `,
      confirmButtonText: 'Cerrar',
    });
  }

  solicitarTurno() {
    Swal.fire('Próximamente', 'Funcionalidad de solicitud de turnos.', 'info');
  }

  async logout() {
    await this.authService.logOut();
    this.router.navigate(['/login']);
  }
}
