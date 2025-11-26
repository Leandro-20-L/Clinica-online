import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';

interface EspecialistaResumen {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-historia-clinica',
  imports: [CommonModule],
  templateUrl: './historia-clinica.component.html',
  styleUrl: './historia-clinica.component.scss'
})
export class HistoriaClinicaComponent {
   @Input() paciente: any = null; 
  @Input() historias: any[] = []; 

  @Input() cerrar!: () => void;

   @Input() descargarPdf?: (historia: any) => void;

   @Input() descargarPdfEspecialista?: (idEspecialista: number, historias: any[]) => void;

    @Input() descargarPdfCompleta?: () => void;
    @Input() descargarPdfPorEspecialidad?: (especialidad: string, historias: any[]) => void;
    @Input() habilitarFiltrosPorEspecialidad = false;

    especialidades: string[] = [];
especialidadSeleccionada: string | null = null;

  
  historiasFiltradas: any[] = [];

    ngOnChanges() {
  this.construirEspecialidades();
  this.aplicarFiltro();
}

resetEspecialidad() {
  this.especialidadSeleccionada = null;
  this.aplicarFiltro();
}

private construirEspecialidades() {
    const setEsp = new Set<string>();

    for (const h of this.historias) {
      const esp = h.turno?.especialidad;
      if (esp) {
        setEsp.add(esp);
      }
    }

    this.especialidades = Array.from(setEsp);

    
    // this.especialidadSeleccionada = null;
  }


  seleccionarEspecialidad(esp: string) {
  this.especialidadSeleccionada = esp;
  this.aplicarFiltro();
}


   onPdfEspecialidad() {
    if (!this.especialidadSeleccionada || !this.descargarPdfPorEspecialidad) return;

    this.descargarPdfPorEspecialidad(
      this.especialidadSeleccionada,
      this.historiasFiltradas
    );
  }

  onClickPdf(h: any) {
    if (this.descargarPdf) {
      this.descargarPdf(h);
    } else {
      console.log('TODO: generar PDF para historia', h);
    }
  }

  onClickPdfCompleta() {
    if (this.descargarPdfCompleta) {
      this.descargarPdfCompleta();
    }
  }

   private aplicarFiltro() {
    if (!this.especialidadSeleccionada) {
      
      this.historiasFiltradas = this.historias;
    } else {
      this.historiasFiltradas = this.historias.filter(
        h => h.turno?.especialidad === this.especialidadSeleccionada
      );
    }
  }

}
