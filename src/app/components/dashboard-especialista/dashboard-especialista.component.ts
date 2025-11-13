import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard-especialista',
  imports: [CommonModule,FormsModule,MatSnackBarModule],
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

  //Historia Clinica
  altura: number | null = null;
peso: number | null = null;
temperatura: number | null = null;
presion: string = '';

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

  async cargarTurnos() {
    this.turnos = await this.turnosService.obtenerTurnosEspecialista(this.especialista.id);
    
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    this.turnosFiltrados = this.turnos
      .filter(t => t.estado === this.filtro)
      .filter(t =>
        (t.especialidad + ' ' + t.usuarios?.nombre + ' ' + t.usuarios?.apellido)
          .toLowerCase()
          .includes(this.filtroTexto.toLowerCase())
      );
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
  // 3) Cambiar estado a realizado
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
