import { Component } from '@angular/core';
import { EspecialidadService } from '../../services/especialidad.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiaEsPipe } from '../../pipes/dia-es.pipe';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { HorariosService } from '../../services/horarios.service';
import { UsuariosService } from '../../services/usuarios.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-solicitar-turno',
  imports: [CommonModule,FormsModule,DiaEsPipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.scss'
})
export class SolicitarTurnoComponent {
  especialidades: string[] = [];
  especialistas: any[] = [];
   especialidadesDelProfesional: string[] = [];
  paciente: any = null;

   pacienteSeleccionado: any = null;  // paciente al que se le crea el turno
  esAdmin = false;
  pacientes: any[] = [];   
  usuarioActual: any = null; 

  especialidadSeleccionada: string | null = null;
  especialistaSeleccionado: any = null;

  diasDisponibles: Date[] = [];
  diaSeleccionado: Date | null = null;
  horariosDisponibles: string[] = [];
  horaSeleccionada: string | null = null;

  horariosDelEspecialista: any[] = []; 
  horasOcupadas: string[] = [];

  private iconosEspecialidad: Record<string, string> = {
    //'Cardiología': 'especialidades/cardiologia.png',
    //'Pediatría': 'especialidades/pediatria.png',
    'Dermatología': 'especialidades/Dermatología.jpg',
    'Tricología': 'especialidades/Tricología.jpg',
    'Traumatología': 'especialidades/Traumatología.jpg',
    // agregá las que uses
  };

  private iconoDefault = 'usuarios/default.png';

  constructor(
    private especialidadService: EspecialidadService,
    private turnosService: TurnosService,
    private authService: AuthService,
    private horariosService: HorariosService,
    private usuariosService: UsuariosService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
     this.especialistas = await this.especialidadService.obtenerTodosLosEspecialistas();

  
  const uid = await this.authService.getUserUid();
  this.paciente = await this.authService.obtenerUsuarioPorUID(uid!);
  this.esAdmin = this.paciente.rol === 'admin';

 
  const idParam = this.route.snapshot.paramMap.get('idPaciente');

  if (this.esAdmin && idParam) {
    
    const idPaciente = Number(idParam);
    this.pacienteSeleccionado = await this.usuariosService.obtenerPorId(idPaciente);
  } else {
    
    this.pacienteSeleccionado = this.paciente;
  }
  }

  obtenerIconoEspecialidad(nombre: string): string {
    if (!nombre) return this.iconoDefault;

    // Normalizar por si viene con mayúsculas/minúsculas distintas
    const clave = nombre.trim();

    return this.iconosEspecialidad[clave] || this.iconoDefault;
  }

  generarProximosDias() {
    const hoy = new Date();
    for (let i = 0; i < 15; i++) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() + i);
      if (dia.getDay() !== 0) this.diasDisponibles.push(dia); 
    }
  }

  async seleccionarEspecialidad(esp: string) {
    this.especialidadSeleccionada = esp;
    
    this.horariosDelEspecialista = await this.horariosService.obtenerPorEspecialista(this.especialistaSeleccionado.id);

    this.generarDiasDisponibles();
  }

  async seleccionarEspecialista(esp: any) {
    this.especialistaSeleccionado = esp;
    this.especialidadesDelProfesional = await this.especialidadService.obtenerEspecialidadesDeEspecialista(esp.id);
  }

 async seleccionarDia(dia: Date) {
  this.diaSeleccionado = dia;

  const fecha = dia.toISOString().split('T')[0];
  const nombreDia = this.obtenerNombreDia(dia);

  const horariosDia = this.horariosDelEspecialista.filter(
    (h: any) => h.dia_semana.toLowerCase() === nombreDia
  );

  this.horariosDisponibles = horariosDia.map((h: any) => h.hora_inicio);

  const { data: turnosTomados } = await this.turnosService
    .obtenerTurnosPorEspecialistaYFecha(
      this.especialistaSeleccionado.id,
      fecha
    );

  const tomados = turnosTomados ?? [];
  this.horasOcupadas = tomados.map((t: any) => t.hora);
  this.horaSeleccionada = null;
} 

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
  }

  async confirmarTurno() {
    if (!this.diaSeleccionado || !this.horaSeleccionada || !this.especialistaSeleccionado) {
      Swal.fire('Error', 'Debe seleccionar día, hora y especialista', 'error');
      return;
    }

    const nuevoTurno = {
      id_paciente: this.pacienteSeleccionado.id,
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

  obtenerNombreDia(fecha: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[fecha.getDay()];
  }

  resetFormulario() {
    this.especialidadSeleccionada = null;
    this.especialistaSeleccionado = null;
    this.diaSeleccionado = null;
    this.horaSeleccionada = null;
  }

  generarDiasDisponibles() {
  this.diasDisponibles = [];

  
  const diasActivos = this.horariosDelEspecialista.map((h: any) => h.dia_semana.toLowerCase());
  const hoy = new Date();

  
  for (let i = 0; i < 15; i++) {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() + i);

    const nombreDia = this.obtenerNombreDia(dia).toLowerCase();
    if (diasActivos.includes(nombreDia)) {
      this.diasDisponibles.push(dia);
    }
  }
}
}
