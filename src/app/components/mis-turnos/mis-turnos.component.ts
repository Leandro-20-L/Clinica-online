import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent {
  turnos: any[] = [];
  paciente: any = null;

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const uid = await this.authService.getUserUid();
    this.paciente = await this.authService.obtenerUsuarioPorUID(uid!);
    const turnosDB = await this.turnosService.obtenerTurnosPaciente(this.paciente.id);

  const ahora = new Date();

  //  turnos aceptados o pendientes y que aún no pasaron
  this.turnos = turnosDB.filter((t: any) => {
    const turnoFechaHora = new Date(`${t.fecha}T${t.hora}`);
    const estadoValido = t.estado === 'pendiente' || t.estado === 'aceptado' || t.estado === 'rechazado';
    return estadoValido && turnoFechaHora > ahora;
  });
  }

  async cancelarTurno(turno: any) {
    const confirm = await Swal.fire({
      title: '¿Cancelar turno?',
      text: `¿Desea cancelar el turno del ${turno.fecha} a las ${turno.hora}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    });

    if (confirm.isConfirmed) {
      await this.turnosService.cancelarTurno(turno.id_turno);
      Swal.fire('Cancelado', 'El turno fue cancelado.', 'success');
      this.turnos = this.turnos.filter(t => t.id_turno !== turno.id_turno);
    }
  }
}
