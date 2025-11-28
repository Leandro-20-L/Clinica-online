import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule,FormsModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent {
  filtro: string = '';
  turnosFiltrados: any[] = [];
  turnos: any[] = [];
  paciente: any = null;
  modalAbierto = false;
modalTitulo = '';
modalContenido = '';
modalAccion : string | null = null;;
turnoActual: any = null;
comentarioEncuesta: string = '';
calificacionEncuesta: number | null = null;
 

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService
  ) {}

  async enviarEncuesta() {

  const datos = {
    comentario_encuesta: this.comentarioEncuesta,
  calificacion: this.calificacionEncuesta,
    completo_encuesta: true
  };

  await this.turnosService.actualizarTurno(this.turnoActual.id_turno, datos);

  Swal.fire("Enviado", "Gracias por completar la encuesta", "success");

  this.cerrarModal();
  this.filtrarTurnos();
}

abrirModal(titulo: string, contenido: string, accion: string | null = null, turno?: any) {
  this.modalAbierto = true;
  this.modalTitulo = titulo;
  this.modalContenido = contenido;
  this.modalAccion = accion;
  this.turnoActual = turno || null;
}

cerrarModal() {
  this.modalAbierto = false;
  this.modalTitulo = '';
  this.modalContenido = '';
  this.modalAccion = '';
}


  async ngOnInit() {
     const uid = await this.authService.getUserUid();
    this.paciente = await this.authService.obtenerUsuarioPorUID(uid!);

    const turnosDB = await this.turnosService.obtenerTurnosPaciente(this.paciente.id);

    const ahora = new Date();

    this.turnos = turnosDB.filter((t: any) => {
      const turnoFechaHora = new Date(`${t.fecha}T${t.hora}`);
      return turnoFechaHora > ahora;
    });

    this.turnosFiltrados = [...this.turnos];
  }

   filtrarTurnos() {
   const txt = this.filtro.toLowerCase().trim();

  if (!txt) {
    this.turnosFiltrados = [...this.turnos];
    return;
  }

  this.turnosFiltrados = this.turnos.filter((t) => {
    const partes: string[] = [];

    // ----- Campos del turno -----
    partes.push(
      t.especialidad,
      t.fecha,
      t.hora,
      t.estado,
      t.usuarios?.nombre,
      t.usuarios?.apellido,
      t.resena,
      t.comentario_cancelacion,
      t.comentario_encuesta
    );

    // ----- Historia clínica -----
    const hc = t.historia_clinica;
    if (hc) {
      // fijos
      partes.push(
        hc.altura?.toString(),
        hc.peso?.toString(),
        hc.temperatura?.toString(),
        hc.presion
      );

      // dinámicos 
      [hc.dato_opcional_1, hc.dato_opcional_2, hc.dato_opcional_3].forEach(
        (opt: any) => {
          if (!opt) return;

          if (typeof opt === 'object') {
            // ej: { "diabetes": "sí", "fuma": "no" }
            Object.entries(opt).forEach(([k, v]) => {
              partes.push(k, String(v));
            });
          } else {
            partes.push(String(opt));
          }
        }
      );
    }

    // ¿Alguna parte contiene el texto?
    const hayCoincidencia = partes
      .filter(Boolean) // saca null/undefined/''
      .some((p) => p.toLowerCase().includes(txt));

    return hayCoincidencia;
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
      
      this.filtrarTurnos();
    }
  }

   verComentario(turno: any) {
    console.log(turno.comentario_cancelacion);
    this.abrirModal(
    'Turno rechazado',
    turno.comentario_cancelacion || 'El especialista no dejó comentarios.'
  );
  }

  verResenia(turno: any) {
    console.log(turno.resena);
     this.abrirModal(
    'Reseña del turno',
    turno.resena || 'El turno no tiene reseña.'
  );
  }

  resolverEncuesta(turno: any) {
     this.abrirModal(
    'Encuesta del turno',
    '',
    'encuesta',
    turno
  );
  }
}
