import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HorariosService } from '../../services/horarios.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule,FormsModule,MatSnackBarModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  @Input() usuario: any = null;
  rol: string = '';
    especialidades: string[] = []; 

  mostrarModal = false;

  diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  horas = [
    '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
    '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00','17:30','18:00','18:30','19:00'
  ];

  disponibilidad: any = {};

  constructor(
    private auth: AuthService, 
    private usuariosService: UsuariosService,
    private router: Router,
    private horariosService: HorariosService,
  private snackBar: MatSnackBar) {}

  async ngOnInit() {
    if (!this.usuario) {
      const uid = await this.auth.getUserUid();
      this.usuario = await this.usuariosService.obtenerPorUID(uid!);
    }

    
    this.rol = this.usuario?.rol || 'paciente';

    this.diasSemana.forEach(dia => {
      this.disponibilidad[dia] = {};
      this.horas.forEach(hora => (this.disponibilidad[dia][hora] = false));
    });

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

  horarios.forEach((h: any) => {
    const diaUI = diaBDtoUI[h.dia_semana.toLowerCase()];
    if (diaUI && this.disponibilidad[diaUI]) {
      this.disponibilidad[diaUI][h.hora_inicio] = true;
    }
  });
}

    if (this.rol === 'especialista' && this.usuario?.id) {
      const data = await this.usuariosService.obtenerEspecialidades(this.usuario.id);
      this.especialidades = data.map((e: any) => e.especialidad);
    }
  }

   abrirModalHorarios() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

   async guardarHorarios() {
    const seleccionados: any[] = [];

    for (const dia of this.diasSemana) {
      for (const hora of this.horas) {
        if (this.disponibilidad[dia][hora]) {
          seleccionados.push({
            id_especialista: this.usuario.id,
            dia_semana: dia.toLowerCase(),
            hora_inicio: hora
          });
        }
      }
    }

    await this.horariosService.guardarDisponibilidad(this.usuario.id, seleccionados);
    this.mostrarModal = false;
    this.snackBar.open('horarios cargados.', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
  }


  volver() {

    if (this.rol == 'admin') this.router.navigate(['/admin']);
    else if (this.rol == 'especialista') this.router.navigate(['/especialista']);
    else this.router.navigate(['/paciente']);
   
}
}
