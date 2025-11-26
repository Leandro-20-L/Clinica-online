import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HorariosService } from '../../services/horarios.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TurnosService } from '../../services/turnos.service';
import { HistoriaClinicaComponent } from '../historia-clinica/historia-clinica.component';
import jsPDF from 'jspdf';

 type DiaSemana = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado';

interface DisponibilidadDia {
  disponible: boolean;
  desde: string;
  hasta: string;
}

type Disponibilidad = { [dia in DiaSemana]: DisponibilidadDia };

@Component({
  selector: 'app-perfil',
  imports: [CommonModule,FormsModule,MatSnackBarModule,HistoriaClinicaComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})

export class PerfilComponent {
  @Input() usuario: any = null;
  rol: string = '';
  especialidades: string[] = []; 

  mostrarHistoria = false;
  historiasPaciente: any[] = [];

  diasSemana: DiaSemana[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  horas = [
    '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
    '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00','17:30','18:00','18:30','19:00'
  ];

  disponibilidad : Disponibilidad = {
  Lunes: { disponible: false, desde: '', hasta: '' },
  Martes: { disponible: false, desde: '', hasta: '' },
  Miercoles: { disponible: false, desde: '', hasta: '' },
  Jueves: { disponible: false, desde: '', hasta: '' },
  Viernes: { disponible: false, desde: '', hasta: '' },
  Sabado: { disponible: false, desde: '', hasta: '' },
};

  constructor(
    private auth: AuthService, 
    private usuariosService: UsuariosService,
    private router: Router,
    private horariosService: HorariosService,
    private turnosService: TurnosService,
    private snackBar: MatSnackBar) {}

  async ngOnInit() {
    if (!this.usuario) {
      const uid = await this.auth.getUserUid();
      this.usuario = await this.usuariosService.obtenerPorUID(uid!);
    }

    this.rol = this.usuario?.rol || 'paciente';

    // Cargar horarios guardados del especialista
    if (this.rol === 'especialista') {
  const horarios = await this.horariosService.obtenerPorEspecialista(this.usuario.id);

  const diaBDtoUI: any = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miercoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sabado"
  };

}

    if (this.rol === 'especialista' && this.usuario?.id) {
      const data = await this.usuariosService.obtenerEspecialidades(this.usuario.id);
      this.especialidades = data.map((e: any) => e.especialidad);
    }
  }

  getDisp(dia: DiaSemana) {
  return this.disponibilidad[dia];
}

  private generarIntervalos(desde: string, hasta: string) {
  const intervalos = [];
  let [h, m] = desde.split(':').map(Number);
  const [hFin, mFin] = hasta.split(':').map(Number);

  while (h < hFin || (h === hFin && m <= mFin)) {
    const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    intervalos.push(hora);

    // sumar 30 minutos
    m += 30;
    if (m === 60) {
      m = 0;
      h++;
    }
  }

  return intervalos;
}

async guardarHorarios() {
  const seleccionados: any[] = [];

  for (const dia of this.diasSemana) {
    const info = this.disponibilidad[dia];

    if (!info.disponible || !info.desde || !info.hasta) continue;

    const horasGeneradas = this.generarIntervalos(info.desde, info.hasta);

    horasGeneradas.forEach(h => {
      seleccionados.push({
        id_especialista: this.usuario.id,
        dia_semana: dia.toLowerCase(),
        hora_inicio: h
      });
    });
  }

  await this.horariosService.guardarDisponibilidad(this.usuario.id, seleccionados);

  this.snackBar.open('Disponibilidad actualizada.', 'Cerrar', {
    duration: 3000,
    panelClass: ['snackbar-ok'],
  });
}

  volver() {
    if (this.rol == 'admin') this.router.navigate(['/admin']);
    else if (this.rol == 'especialista') this.router.navigate(['/especialista']);
    else this.router.navigate(['/paciente']);
  }

async verHistoriaClinica() {
  this.historiasPaciente = await this.turnosService
    .obtenerHistoriasClinicasPaciente(this.usuario.id);
  this.mostrarHistoria = true;
}

cerrarHistoriaClinica() {
  this.mostrarHistoria = false;
}

async generarPDFDeEspecialista(especialistaId: number,historiasDeEse: any[]) {
   const doc = new jsPDF();

  const logo = 'logo.png'; 

  // ---------- ENCABEZADO ----------
  doc.addImage(logo, 'PNG', 80, 10, 50, 40);
  doc.setFontSize(18);
  doc.text('Historia Clínica', 75, 60);

  const paciente = this.usuario; 

  doc.setFontSize(12);
  doc.text(`Paciente: ${paciente.nombre} ${paciente.apellido}`, 10, 75);

  const espNombre = `${historiasDeEse[0]?.turno?.especialista?.nombre ?? ''} ${historiasDeEse[0]?.turno?.especialista?.apellido ?? ''}`.trim()
    || `Especialista #${especialistaId}`;

  doc.text(`Especialista: ${espNombre}`, 10, 85);
  doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 10, 95);

  let y = 110;

  // ---------- HISTORIAS DE ESE ESPECIALISTA ----------
  for (let i = 0; i < historiasDeEse.length; i++) {
    const h = historiasDeEse[i];

    doc.setFontSize(14);
    doc.text(`Historia ${i + 1}`, 10, y); y += 10;

    doc.setFontSize(12);

    doc.text(`Fecha turno: ${h.turno?.fecha} ${h.turno?.hora}`, 10, y); y += 8;
    doc.text(`Especialidad: ${h.turno?.especialidad}`, 10, y); y += 10;

    doc.text(`Altura: ${h.altura} cm`, 10, y); y += 8;
    doc.text(`Peso: ${h.peso} kg`, 10, y); y += 8;
    doc.text(`Temperatura: ${h.temperatura} °C`, 10, y); y += 8;
    doc.text(`Presión: ${h.presion}`, 10, y); y += 8;

    if (h.dato_opcional_1?.clave) {
      doc.text(`${h.dato_opcional_1.clave}: ${h.dato_opcional_1.valor}`, 10, y); y += 8;
    }
    if (h.dato_opcional_2?.clave) {
      doc.text(`${h.dato_opcional_2.clave}: ${h.dato_opcional_2.valor}`, 10, y); y += 8;
    }
    if (h.dato_opcional_3?.clave) {
      doc.text(`${h.dato_opcional_3.clave}: ${h.dato_opcional_3.valor}`, 10, y); y += 8;
    }

    doc.text('-----------------------------', 10, y); 
    y += 12;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  const nombreArchivo = `Historias_${paciente.nombre}_${espNombre}_${new Date().toISOString()}.pdf`;
  doc.save(nombreArchivo);
}

  descargarPdfHistoria(h: any) {
    
    if (!h) { 
      console.warn('Historia inválida para PDF');
      return;
    }

    const doc = new jsPDF();

    const pacienteNombre = `${this.usuario?.nombre ?? ''} ${this.usuario?.apellido ?? ''}`.trim();

    // Nombre completo del especialista 
    const espNombre = (
      ((h.turno?.especialista?.nombre ?? '') + ' ' + (h.turno?.especialista?.apellido ?? '')).trim()
      || `Especialista #${h.id_especialista}`
    );

    const logoPath = 'logo.png';

    // ---------- ENCABEZADO ----------
    doc.addImage(logoPath, 'PNG', 80, 10, 50, 40);

    doc.setFontSize(16);
    doc.text('Historia Clínica', 105, 60, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Paciente: ${pacienteNombre}`, 10, 75);
    doc.text(`Especialista: ${espNombre}`, 10, 83);

    const fechaTurno = h.turno?.fecha ?? '';
    const horaTurno  = h.turno?.hora  ?? '';

    doc.text(`Fecha del turno: ${fechaTurno} ${horaTurno}`, 10, 91);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 10, 99);

    let y = 115;

    // ---------- RESEÑA ----------
    if (h.resena) {
      doc.setFontSize(13);
      doc.text('Reseña:', 10, y);
      y += 8;

      doc.setFontSize(12);
      const textoResena = doc.splitTextToSize(h.resena, 180);
      doc.text(textoResena, 10, y);
      y += textoResena.length * 6 + 4;
    }

    // ---------- DATOS CLÍNICOS ----------
    doc.setFontSize(13);
    doc.text('Datos clínicos', 10, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`Altura: ${h.altura} cm`, 10, y); y += 6;
    doc.text(`Peso: ${h.peso} kg`, 10, y); y += 6;
    doc.text(`Temperatura: ${h.temperatura} °C`, 10, y); y += 6;
    doc.text(`Presión: ${h.presion}`, 10, y); y += 10;

    // ---------- DATOS OPCIONALES ----------
    const opcionales = [
      h.dato_opcional_1,
      h.dato_opcional_2,
      h.dato_opcional_3
    ];

    const tieneOpcionales = opcionales.some(d => d?.clave);

    if (tieneOpcionales) {
      doc.setFontSize(13);
      doc.text('Datos adicionales', 10, y);
      y += 8;
      doc.setFontSize(12);

      for (const dato of opcionales) {
        if (dato?.clave) {
          const linea = `${dato.clave}: ${dato.valor}`;
          const txt = doc.splitTextToSize(linea, 180);
          doc.text(txt, 10, y);
          y += txt.length * 6 + 2;
        }
      }
    }

    // ---------- GUARDAR ----------
    const safeFecha = fechaTurno || new Date().toISOString().split('T')[0];
    const nombreArchivo = `Historia_${pacienteNombre.replace(/\s+/g, '_')}_${safeFecha}.pdf`;
    doc.save(nombreArchivo);
  }

  descargarHistoriaCompleta() {
    if (!this.historiasPaciente.length) {
      console.log('No hay historias clínicas para este paciente');
      return;
    }

    const doc = new jsPDF();
    const logo = 'logo.png'; 

    // --- ENCABEZADO ---
    doc.addImage(logo, 'PNG', 80, 10, 50, 40);
    doc.setFontSize(18);
    doc.text('Historia Clínica - Informe completo', 45, 60);

    doc.setFontSize(12);
    doc.text(
      `Paciente: ${this.usuario.nombre} ${this.usuario.apellido}`,
      10,
      75
    );
    doc.text(
      `Fecha de emisión: ${new Date().toLocaleString()}`,
      10,
      85
    );

    let y = 105;

    // --- TODAS LAS HISTORIAS ---
    this.historiasPaciente.forEach((h, index) => {
      doc.setFontSize(14);
      doc.text(`Historia ${index + 1}`, 10, y);
      y += 8;

      doc.setFontSize(12);

      doc.text(
        `Fecha turno: ${h.turno?.fecha} ${h.turno?.hora}`,
        10,
        y
      ); y += 8;

      doc.text(
        `Especialidad: ${h.turno?.especialidad}`,
        10,
        y
      ); y += 8;

      const espNombre = `${h.turno?.especialista?.nombre ?? ''} ${h.turno?.especialista?.apellido ?? ''}`.trim();
      if (espNombre) {
        doc.text(`Especialista: ${espNombre}`, 10, y);
        y += 8;
      }

      doc.text(`Altura: ${h.altura} cm`, 10, y); y += 8;
      doc.text(`Peso: ${h.peso} kg`, 10, y); y += 8;
      doc.text(`Temperatura: ${h.temperatura} °C`, 10, y); y += 8;
      doc.text(`Presión: ${h.presion}`, 10, y); y += 8;

      if (h.dato_opcional_1?.clave) {
        doc.text(`${h.dato_opcional_1.clave}: ${h.dato_opcional_1.valor}`, 10, y); y += 8;
      }
      if (h.dato_opcional_2?.clave) {
        doc.text(`${h.dato_opcional_2.clave}: ${h.dato_opcional_2.valor}`, 10, y); y += 8;
      }
      if (h.dato_opcional_3?.clave) {
        doc.text(`${h.dato_opcional_3.clave}: ${h.dato_opcional_3.valor}`, 10, y); y += 8;
      }

      doc.text('-----------------------------', 10, y);
      y += 12;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    const fileName = `HistoriaClinicaCompleta_${this.usuario.apellido}_${new Date().toISOString()}.pdf`;
    doc.save(fileName);
  }

  descargarPdfPorEspecialidad(especialidad: string, historias: any[]) {
  const doc = new jsPDF();

  const logo = 'logo.png';

  doc.addImage(logo, 'PNG', 80, 10, 50, 40);
  doc.setFontSize(18);
  doc.text(`Historias de ${especialidad}`, 65, 60);

  doc.setFontSize(12);
  doc.text(`Paciente: ${this.usuario.nombre} ${this.usuario.apellido}`, 10, 75);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 10, 85);

  let y = 100;

  historias.forEach((h, i) => {
    doc.setFontSize(14);
    doc.text(`Historia ${i + 1}`, 10, y); y += 8;

    doc.setFontSize(12);

    doc.text(`Fecha turno: ${h.turno.fecha} ${h.turno.hora}`, 10, y); y += 8;
    doc.text(`Especialista: ${h.turno.especialista.nombre} ${h.turno.especialista.apellido}`, 10, y); y += 8;
    doc.text(`Altura: ${h.altura} cm`, 10, y); y += 8;
    doc.text(`Peso: ${h.peso} kg`, 10, y); y += 8;
    doc.text(`Temperatura: ${h.temperatura} °C`, 10, y); y += 8;
    doc.text(`Presión: ${h.presion}`, 10, y); y += 12;

    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save(`Historia_${especialidad}_${this.usuario.apellido}.pdf`);
}
}
