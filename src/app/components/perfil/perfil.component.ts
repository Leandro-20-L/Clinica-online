import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HorariosService } from '../../services/horarios.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

 type DiaSemana = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado';

interface DisponibilidadDia {
  disponible: boolean;
  desde: string;
  hasta: string;
}

type Disponibilidad = { [dia in DiaSemana]: DisponibilidadDia };

@Component({
  selector: 'app-perfil',
  imports: [CommonModule,FormsModule,MatSnackBarModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})

export class PerfilComponent {
  @Input() usuario: any = null;
  rol: string = '';
  especialidades: string[] = []; 
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
}
