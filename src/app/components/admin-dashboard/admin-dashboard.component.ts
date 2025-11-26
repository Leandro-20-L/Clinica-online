import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import * as XLSX from 'xlsx';

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
    console.log('Funcionalidad para crear nuevo usuario (Sprint 2)');
  }

  async logout() {
    await this.authService.logOut();
    this.router.navigate(['/bienvenida']);
  }

    verSeccion(nombre: string) {
    this.seccionActual = nombre;
  }

  irA(seccion:string){
    this.router.navigate([`/${seccion}`])
  }

  exportarExcelUsuarios() {
  this.usuariosService.obtenerTodos().then(todos => {

    // 🔹 Armamos los datos para el Excel
     const sinAdmins = todos.filter((u: any) => u.rol !== 'admin');

    const datos = sinAdmins.map((u: any) => ({
      ID: u.uid || u.id,
      Nombre: u.nombre,
      Apellido: u.apellido,
      DNI: u.dni,
      Email: u.mail,
      Rol: u.rol,
      Especialidad:
        u.especialidad ||
        (Array.isArray(u.especialidades) ? u.especialidades.join(', ') : ''),
    }));

    // 🔹 Convertir JSON a hoja Excel
    const hoja = XLSX.utils.json_to_sheet(datos);

    // 🔹 Crear libro y agregar hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Usuarios');

    // 🔹 Descargar archivo
    XLSX.writeFile(libro, 'usuarios_clinica_online.xlsx');
  });
}
}
