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
  usuarios: any[] = [];
  totalUsuarios = 0;
  totalPacientes = 0;
  totalEspecialistas = 0;
  seccionActual: string = 'especialistas';

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
     const todos = await this.usuariosService.obtenerTodos();

    this.usuarios = todos.filter(u => u.rol === 'especialista');
    this.totalUsuarios = todos.length;
    this.totalPacientes = todos.filter(u => u.rol === 'paciente').length;
    this.totalEspecialistas = this.usuarios.length;
    
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
    //console.log('Funcionalidad para crear nuevo usuario (Sprint 2)');
    console.log("hola");
  }

  async logout() {
    await this.authService.logOut();
    this.router.navigate(['/bienvenida']);
  }

    verSeccion(nombre: string) {
    this.seccionActual = nombre;
  }

  irA(seccion:string){
    console.log('Navegando a:', seccion);
    this.router.navigate([`/${seccion}`])
  }

  SolicitarTurno(paciente: any){
    
    this.router.navigate(['/solicitar-turno', paciente.id]);
  }

  irAltaUsuario() {
  this.router.navigate(['/admin/alta-usuario']);
}
}

