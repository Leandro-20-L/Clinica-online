import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
   adminName: string = 'Admin';
  usuarios: any[] = [];
  totalUsuarios = 0;
  totalPacientes = 0;
  totalEspecialistas = 0;

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.usuarios = await this.usuariosService.obtenerTodos();
    this.totalUsuarios = this.usuarios.length;
    this.totalPacientes = this.usuarios.filter(u => u.rol === 'paciente').length;
    this.totalEspecialistas = this.usuarios.filter(u => u.rol === 'especialista').length;
  }

  async habilitar(uid: string) {
    await this.usuariosService.actualizar(uid, { habilitado: true });
    await this.cargarUsuarios();
  }

  async deshabilitar(uid: string) {
    await this.usuariosService.actualizar(uid, { habilitado: false });
    await this.cargarUsuarios();
  }

  abrirModalNuevoUsuario() {
    alert('Funcionalidad para crear nuevo usuario (Sprint 2)');
  }

  async logout() {
    await this.authService.logOut();
    this.router.navigate(['/login']);
  }
}
