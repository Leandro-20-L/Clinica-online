import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-paciente',
  imports: [CommonModule],
  templateUrl: './dashboard-paciente.component.html',
  styleUrl: './dashboard-paciente.component.scss'
})
export class DashboardPacienteComponent {
  paciente: any = null;
  turnos: any[] = [];

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  async ngOnInit() {
    const uid = await this.authService.getUserUid();
    this.paciente = await this.usuariosService.obtenerPorUID(uid!);
    
    this.turnos = [];
  }

  async logout() {
    await this.authService.logOut();
    this.router.navigate(['/bienvenida']);
  }

  irA(seccion: string) {
  this.router.navigate([`/paciente/${seccion}`]);

}

  perfil(){
    this.router.navigate([`/perfil`]);
  }
}
