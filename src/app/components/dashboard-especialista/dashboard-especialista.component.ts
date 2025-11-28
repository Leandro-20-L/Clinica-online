import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';
import { HistoriaClinicaComponent } from '../historia-clinica/historia-clinica.component';

@Component({
  selector: 'app-dashboard-especialista',
  imports: [CommonModule,FormsModule,MatSnackBarModule,HistoriaClinicaComponent],
  templateUrl: './dashboard-especialista.component.html',
  styleUrl: './dashboard-especialista.component.scss'
})
export class DashboardEspecialistaComponent {
    especialista: any = null;
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filtro: string = 'pendiente'; 
  filtroTexto = '';
  resenia: string = '';

  // MODAL
  modalAbierto = false;
  modalTitulo = '';
  turnoActual: any = null;
  textoResenia = '';

  listaPacientesVisible = false;
pacientesAtendidos: any[] = [];

  //Historia Clinica
  altura: number | null = null;
peso: number | null = null;
temperatura: number | null = null;
presion: string = '';
viendoPaciente = null;
historiasPaciente :  any[] = [];

dato1: any = { clave: '', valor: '' };
dato2: any = { clave: '', valor: '' };
dato3: any = { clave: '', valor: '' };

  constructor(
    private authService: AuthService,
    private turnosService: TurnosService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

 abrirHistoriaClinica(turno: any) {
  this.turnoActual = turno;
  this.modalTitulo = 'Historia clínica del turno';

  this.textoResenia = '';
  this.altura = null;
  this.peso = null;
  this.temperatura = null;
  this.presion = '';

  this.dato1 = { clave: '', valor: '' };
  this.dato2 = { clave: '', valor: '' };
  this.dato3 = { clave: '', valor: '' };

  this.modalAbierto = true;
}

  async ngOnInit() {
    const uid = await this.authService.getUserUid();
    this.especialista = await this.authService.obtenerUsuarioPorUID(uid!);

    await this.cargarTurnos();
  }

  async mostrarPacientesAtendidos() {
  const turnosRealizados = this.turnos.filter(t => t.estado === 'realizado');

  const idsUnicos = Array.from(new Set(turnosRealizados.map(t => t.id_paciente)));

  this.pacientesAtendidos = [];

  for (const id of idsUnicos) {
    const paciente = await this.turnosService.obtenerPacientePorId(id);
    if (paciente) this.pacientesAtendidos.push(paciente);
  }

  this.listaPacientesVisible = true;
}

cerrarListaPacientes() {
  this.listaPacientesVisible = false;
}


  async verHistorias(p: any) {
  this.viendoPaciente = p;
  const todas = await this.turnosService.obtenerHistoriasClinicasPaciente(p.id);

  this.historiasPaciente = todas.filter(
    (h: any) => h.id_especialista === this.especialista.id
  );
}

cerrarHistorias() {
  this.viendoPaciente = null;
}

  async cargarTurnos() {
    this.turnos = await this.turnosService.obtenerTurnosEspecialista(this.especialista.id);
    
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    const texto = this.filtroTexto.toLowerCase().trim();

  this.turnosFiltrados = this.turnos.filter((t: any) => {
    // 1) Filtro por estado (si se eligió uno)
    if (this.filtro && this.filtro !== 'todos' && t.estado !== this.filtro) {
      return false;
    }

    // 2) Si no hay texto, ya pasó el filtro de estado → mostrar
    if (!texto) return true;

    const partes: string[] = [];

    // ----- Datos del turno -----
    partes.push(
      t.especialidad,
      t.fecha,
      t.hora,
      t.estado,
      t.comentario_cancelacion,
      t.resena,
      t.comentario_encuesta
    );

    // ----- Datos del paciente -----
    partes.push(
      t.usuarios?.nombre,
      t.usuarios?.apellido,
      t.usuarios?.obra_social
    );

    // ----- Historia clínica -----
    const hc = t.historia_clinica;
    if (hc) {
      // Campos fijos
      partes.push(
        hc.altura?.toString(),
        hc.peso?.toString(),
        hc.temperatura?.toString(),
        hc.presion
      );

      // Campos dinámicos (jsonb)
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
      .filter(Boolean)                    // saco null/undefined/''
      .some((p) => p.toLowerCase().includes(texto));

    return hayCoincidencia;
  });
  }

  cambiarFiltro(nuevo: string) {
    this.filtro = nuevo;
    this.aplicarFiltro();
  }

  filtrarTurnos() {
    this.aplicarFiltro();
  }

  async aceptarTurno(turno: any) {
    await this.turnosService.actualizarEstadoTurno(turno.id_turno, 'aceptado');
    Swal.fire('Turno aceptado', '', 'success');
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

    abrirResenia(turno: any) {
    this.turnoActual = turno;
    this.modalTitulo = 'Cargar reseña del turno';
    this.textoResenia = turno.resena || '';
    this.modalAbierto = true;
  }

  async guardarResenia() {

    if (!this.validarHistoriaClinica()) return;

    await this.turnosService.actualizarTurno(this.turnoActual.id_turno, {
      resena: this.textoResenia
    });

    await this.turnosService.guardarHistoriaClinica({
    id_turno: this.turnoActual.id_turno,
    id_paciente: this.turnoActual.usuarios.id,
    id_especialista: this.turnoActual.id_especialista,
    altura: this.altura,
    peso: this.peso,
    temperatura: this.temperatura,
    presion: this.presion,
    dato_opcional_1: this.dato1,
    dato_opcional_2: this.dato2,
    dato_opcional_3: this.dato3
  });
  console.log(this.turnoActual.usuarios.id);
  
  await this.turnosService.actualizarEstadoTurno(this.turnoActual.id_turno, 'realizado');

  Swal.fire('Turno finalizado', 'La historia clínica fue registrada.', 'success');

    this.cerrarModal();
    await this.cargarTurnos();
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  logout() {
  this.authService.logOut();
  this.router.navigate(['/bienvenida']);
}

  irAPerfil(){
    this.router.navigate(['perfil'])
  }

  mostrarSnack(mensaje: string, tipo: 'error' | 'ok' = 'error') {
  this.snack.open(mensaje, 'Cerrar', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    panelClass: tipo === 'error' ? ['snack-error'] : ['snack-ok']
  });
}

validarHistoriaClinica(): boolean {

  
  if (!this.textoResenia.trim()) {
    this.mostrarSnack('Debe ingresar una reseña.');
    return false;
  }

  if (!this.altura || this.altura <= 0 || this.altura > 250) {
    this.mostrarSnack('Ingrese una altura válida (0 - 250 cm).');
    return false;
  }

  if (!this.peso || this.peso <= 0 || this.peso > 300) {
    this.mostrarSnack('Ingrese un peso válido (0 - 300 kg).');
    return false;
  }

  if (!this.temperatura || this.temperatura < 30 || this.temperatura > 45) {
    this.mostrarSnack('La temperatura debe estar entre 30°C y 45°C.');
    return false;
  }

  if (!this.presion.trim()) {
    this.mostrarSnack('Debe ingresar la presión arterial.');
    return false;
  }

  if (this.dato1.clave && !this.dato1.valor) {
    this.mostrarSnack('Falta el valor del dato opcional 1.');
    return false;
  }

  if (this.dato2.clave && !this.dato2.valor) {
    this.mostrarSnack('Falta el valor del dato opcional 2.');
    return false;
  }

  if (this.dato3.clave && !this.dato3.valor) {
    this.mostrarSnack('Falta el valor del dato opcional 3.');
    return false;
  }

  return true;
}

}
