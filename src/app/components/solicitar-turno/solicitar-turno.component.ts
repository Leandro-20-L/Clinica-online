import { Component } from '@angular/core';
import { EspecialidadService } from '../../services/especialidad.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiaEsPipe } from '../../pipes/dia-es.pipe';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-solicitar-turno',
  imports: [CommonModule,FormsModule,DiaEsPipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.scss'
})
export class SolicitarTurnoComponent {
  especialidades: string[] = [];
  especialistas: any[] = [];
  paciente: any = null;

  especialidadSeleccionada: string | null = null;
  especialistaSeleccionado: any = null;

  fechaSeleccionada: string | null = null;
  horaSeleccionada: string | null = null;
  diasDisponibles: Date[] = [];
  diaSeleccionado: Date | null = null;
  horariosDisponibles: string[] = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00'
];
  

  constructor(private especialidadService: EspecialidadService,private turnosService: TurnosService, private authService: AuthService) {}

  async ngOnInit() {
    this.especialidades = await this.especialidadService.obtenerEspecialidades();
    this.generarProximosDias();
     
    //  paciente logueado
     const uid = await this.authService.getUserUid();
    this.paciente = await this.authService.obtenerUsuarioPorUID(uid!); 

    console.log('Paciente cargado:', this.paciente);
  }

  generarProximosDias() {
  const hoy = new Date();
  for (let i = 0; i < 7; i++) {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() + i);
    
    if (dia.getDay() !== 0) this.diasDisponibles.push(dia);
  }
}

  seleccionarDia(dia: Date) {
  this.diaSeleccionado = dia;
}

seleccionarHora(hora: string) {
  this.horaSeleccionada = hora;
}
  async seleccionarEspecialidad(esp: string) {
    this.especialidadSeleccionada = esp;
    this.especialistas = await this.especialidadService.obtenerEspecialistasPorEspecialidad(esp);
  }

  seleccionarEspecialista(esp: any) {
    this.especialistaSeleccionado = esp;
  }

  async confirmarTurno() {
    if (!this.diaSeleccionado || !this.horaSeleccionada || !this.especialistaSeleccionado) {
      Swal.fire('Error', 'Debe seleccionar día, hora y especialista', 'error');
      return;
    }

    const nuevoTurno = {
      id_paciente: this.paciente.id,
      id_especialista: this.especialistaSeleccionado.id,
      especialidad: this.especialidadSeleccionada,
      fecha: this.diaSeleccionado.toISOString().split('T')[0],
      hora: this.horaSeleccionada,
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString()
    };

    try {
      await this.turnosService.crearTurno(nuevoTurno);
      Swal.fire('Turno solicitado', 'Su solicitud fue enviada correctamente.', 'success');
      this.resetFormulario();
    } catch (error) {
      Swal.fire('Error', 'No se pudo registrar el turno.', 'error');
    }
  }

  resetFormulario() {
    this.especialidadSeleccionada = null;
    this.especialistaSeleccionado = null;
    this.diaSeleccionado = null;
    this.horaSeleccionada = null;
  }
}
