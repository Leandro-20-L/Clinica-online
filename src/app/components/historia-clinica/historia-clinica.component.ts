import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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
}
