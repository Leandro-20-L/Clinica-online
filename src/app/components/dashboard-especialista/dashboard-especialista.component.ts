import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-especialista',
  imports: [CommonModule],
  templateUrl: './dashboard-especialista.component.html',
  styleUrl: './dashboard-especialista.component.scss'
})
export class DashboardEspecialistaComponent {
    especialista: any = null;
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filtro: string = 'pendiente'; 

  constructor(
    private authService: AuthService,
    private turnosService: TurnosService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const uid = await this.authService.getUserUid();
    this.especialista = await this.authService.obtenerUsuarioPorUID(uid!);

    await this.cargarTurnos();
  }

  async cargarTurnos() {
    this.turnos = await this.turnosService.obtenerTurnosEspecialista(this.especialista.id);
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    this.turnosFiltrados = this.turnos.filter(t => t.estado === this.filtro);
  }

  cambiarFiltro(nuevo: string) {
    this.filtro = nuevo;
    this.aplicarFiltro();
  }

  async aceptarTurno(turno: any) {
    await this.turnosService.actualizarEstadoTurno(turno.id_turno, 'aceptado');
    Swal.fire('Turno aceptado', 'El turno fue confirmado correctamente.', 'success');
    await this.cargarTurnos();
  }

  async rechazarTurno(turno: any) {
    const { value: motivo } = await Swal.fire({
      title: 'Rechazar turno',
      input: 'text',
      inputPlaceholder: 'Motivo del rechazo',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar'
    });

    if (motivo) {
      await this.turnosService.actualizarEstadoTurno(turno.id_turno, 'rechazado', motivo);
      Swal.fire('Turno rechazado', 'Se notificó al paciente.', 'success');
      await this.cargarTurnos();
    }
  }

  async marcarRealizado(turno: any) {
    await this.turnosService.actualizarEstadoTurno(turno.id_turno, 'realizado');
    Swal.fire('Turno finalizado', 'El turno fue marcado como realizado.', 'success');
    await this.cargarTurnos();
  }

  logout() {
  this.authService.logOut();
  this.router.navigate(['/bienvenida']);
}

  irAPerfil(){
    this.router.navigate(['perfil'])
  }
}
