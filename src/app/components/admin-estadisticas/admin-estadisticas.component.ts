import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { TurnosService } from '../../services/turnos.service';
import { UsuariosService } from '../../services/usuarios.service';
import { LogsService } from '../../services/logs.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FechaLocalPipe } from '../../pipes/fecha-local.pipe';

interface LogIngreso {
  usuario: string;
  fechaHora: string;
}

@Component({
  selector: 'app-admin-estadisticas',
  imports: [CommonModule,FormsModule,NgChartsModule,FechaLocalPipe],
  templateUrl: './admin-estadisticas.component.html',
  styleUrl: './admin-estadisticas.component.scss'
})
export class AdminEstadisticasComponent implements OnInit {
  @ViewChild('cardLog')          cardLogRef!: ElementRef;
  @ViewChild('cardEspecialidad') cardEspecialidadRef!: ElementRef;
  @ViewChild('cardDia')          cardDiaRef!: ElementRef;
  @ViewChild('cardSolicitados')  cardSolicitadosRef!: ElementRef;
  @ViewChild('cardFinalizados')  cardFinalizadosRef!: ElementRef;

  logs: LogIngreso[] = [];

  // ====== TURNOS POR ESPECIALIDAD ======
  turnosPorEspecialidadData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Turnos', data: [] }],
  };
  turnosPorEspecialidadOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // ====== TURNOS POR DÍA ======
  fechaTurnosDia: string | null = null; 
  turnosPorDiaData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Turnos', data: [] }],
  };
  turnosPorDiaOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // ====== SOLICITADOS POR MÉDICO ======
  especialistas: any[] = [];
  especialistaSolicitadosId: number | null = null;
  fechaDesdeSolicitados: string | null = null;
  fechaHastaSolicitados: string | null = null;

  turnosSolicitadosData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Turnos solicitados', data: [] }],
  };
  turnosSolicitadosOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // ====== FINALIZADOS POR MÉDICO ======
  especialistaFinalizadosId: number | null = null;
  fechaDesdeFinalizados: string | null = null;
  fechaHastaFinalizados: string | null = null;

  turnosFinalizadosData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Turnos finalizados', data: [] }],
  };
  turnosFinalizadosOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(
    private turnosService: TurnosService,
    private usuariosService: UsuariosService,
    private logsService: LogsService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.cargarLogIngresos(),
      this.cargarEspecialistas(),
      this.cargarTurnosPorEspecialidad(),
      this.cargarTurnosPorDiaInicial(),
    ]);
  }

   // ========= HELPER GENERAL =========
  private async generarPdfDesdeElemento(
    element: HTMLElement,
    nombreArchivo: string
  ) {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(nombreArchivo);
  }

  // ========= FUNCIONES POR SECCIÓN =========
  generarPdfLog() {
    this.generarPdfDesdeElemento(
      this.cardLogRef.nativeElement,
      'log-ingresos.pdf'
    );
  }

  generarPdfEspecialidad() {
    this.generarPdfDesdeElemento(
      this.cardEspecialidadRef.nativeElement,
      'turnos-por-especialidad.pdf'
    );
  }

  generarPdfDia() {
    this.generarPdfDesdeElemento(
      this.cardDiaRef.nativeElement,
      'turnos-por-dia.pdf'
    );
  }

  generarPdfSolicitados() {
    this.generarPdfDesdeElemento(
      this.cardSolicitadosRef.nativeElement,
      'turnos-solicitados-por-medico.pdf'
    );
  }

  generarPdfFinalizados() {
    this.generarPdfDesdeElemento(
      this.cardFinalizadosRef.nativeElement,
      'turnos-finalizados-por-medico.pdf'
    );
  }

  // ================== LOG ==================
  async cargarLogIngresos() {
    try {
    const raw = await this.logsService.obtenerLogIngresos(); 
    const usuarios = await this.usuariosService.obtenerTodos();

    this.logs = raw.map((item: any) => {
      const user = usuarios.find((u: any) => u.id === item.id_usuario);

      const fechaCompleta = item.fecha_hora as string; 
      const [fecha, horaCompleta] = fechaCompleta.split('T');
      const hora = horaCompleta?.substring(0, 8);

      return {
        usuario: user ? `${user.apellido}, ${user.nombre}` : `ID ${item.id_usuario}`,
          fechaHora: item.fecha_hora 
      } as LogIngreso;
    });

  } catch (err) {
    console.error('Error al cargar logs', err);
  }
  }

  // ================== ESPECIALISTAS ==================
  async cargarEspecialistas() {
    try {
      const todos = await this.usuariosService.obtenerTodos();
      this.especialistas = todos.filter((u: any) => u.rol === 'especialista');
    } catch (err: any) {
  console.error('Error al cargar turnos por día', err?.message, err);
}
  }

  // ================== TURNOS POR ESPECIALIDAD ==================
  async cargarTurnosPorEspecialidad() {
  try {
    const datos = await this.turnosService.obtenerCantidadTurnosPorEspecialidad();

    this.turnosPorEspecialidadData = {
      labels: datos.map((d: any) => d.especialidad),
      datasets: [{
        label: 'Turnos',
        data: datos.map((d: any) => d.count),
      }],
    };
  } catch (err: any) {
    console.error('Error al cargar turnos por especialidad', err?.message, err);
  }
}
  

  // ================== TURNOS POR DÍA ==================
  async cargarTurnosPorDiaInicial() {
    try {
      const datos = await this.turnosService.obtenerCantidadTurnosPorDia();
      this.actualizarChartDia(datos);
    } catch (err: any) {
  console.error('Error al cargar turnos por día', err?.message, err);
}
  }

  async onSeleccionarFechaDia() {
    try {
      if (!this.fechaTurnosDia) {
        await this.cargarTurnosPorDiaInicial();
        return;
      }

      const datos = await this.turnosService.obtenerCantidadTurnosPorDia(
        this.fechaTurnosDia,
        this.fechaTurnosDia
      );
      this.actualizarChartDia(datos);
    } catch (err: any) {
  console.error('Error al cargar turnos por día', err?.message, err);
}
  }

  private actualizarChartDia(datos: any[]) {
     this.turnosPorDiaData = {
    labels: datos.map(d => d.fecha),
    datasets: [{
      label: 'Turnos',
      data: datos.map(d => d.count),
    }],
  };
  }

  // ================== SOLICITADOS POR MÉDICO ==================
  async actualizarTurnosSolicitados() {
    try {
      if (
        !this.especialistaSolicitadosId ||
        !this.fechaDesdeSolicitados ||
        !this.fechaHastaSolicitados
      ) {
        this.turnosSolicitadosData.labels = [];
        this.turnosSolicitadosData.datasets[0].data = [];
        return;
      }

      const datos = await this.turnosService.obtenerTurnosSolicitadosPorMedico(
        this.especialistaSolicitadosId,
        this.fechaDesdeSolicitados,
        this.fechaHastaSolicitados
      );

      this.turnosSolicitadosData = {
    labels: datos.map((d: any) => d.fecha),
    datasets: [{ label: 'Turnos solicitados', data: datos.map((d: any) => d.count) }],
  };
    } catch (err: any) {
  console.error('Error al cargar turnos por día', err?.message, err);
}
  }

  // ================== FINALIZADOS POR MÉDICO ==================
  async actualizarTurnosFinalizados() {
    try {
      if (
        !this.especialistaFinalizadosId ||
        !this.fechaDesdeFinalizados ||
        !this.fechaHastaFinalizados
      ) {
        this.turnosFinalizadosData.labels = [];
        this.turnosFinalizadosData.datasets[0].data = [];
        return;
      }

      const datos = await this.turnosService.obtenerTurnosFinalizadosPorMedico(
        this.especialistaFinalizadosId,
        this.fechaDesdeFinalizados,
        this.fechaHastaFinalizados
      );

      this.turnosFinalizadosData = {
    labels: datos.map((d: any) => d.fecha),
    datasets: [{ label: 'Turnos finalizados', data: datos.map((d: any) => d.count) }],
  };

    } catch (err: any) {
  console.error('Error al cargar turnos por día', err?.message, err);
}
  }
}
