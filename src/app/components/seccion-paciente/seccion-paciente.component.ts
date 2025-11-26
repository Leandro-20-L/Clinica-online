import { Component } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../services/turnos.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-seccion-paciente',
  imports: [CommonModule],
  templateUrl: './seccion-paciente.component.html',
  styleUrl: './seccion-paciente.component.scss'
})
export class SeccionPacienteComponent {
   pacientes: any[] = [];
   usuarios: any[] = [];

  constructor(private usuariosService: UsuariosService,private turnosService: TurnosService, private router: Router) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

   async cargarUsuarios() {
    try {
      const todos = await this.usuariosService.obtenerTodos();
      this.usuarios = todos;
      this.pacientes = todos.filter((u: any) => u.rol === 'paciente' || u.rol === 'especialista');
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error.message);
    }
  }
    volver() {
    this.router.navigate(['/admin']);
  }

  exportarExcelUsuarios() {
    this.usuariosService.obtenerTodos().then(todos => {
    
        // Se arma los datos para el Excel
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
    
        // Se convierte el JSON a hoja Excel
        const hoja = XLSX.utils.json_to_sheet(datos);
    
        // Crea el libro y agregar hoja
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Usuarios');
    
        // Descargar archivo
        XLSX.writeFile(libro, 'usuarios_clinica_online.xlsx');
      });
  }

  
  async exportarExcelTurnosPaciente(paciente: any) {
    const turnos = await this.turnosService.obtenerTurnosDePaciente(paciente.id);

    const datos = turnos.map((t: any) => ({
      Paciente: `${paciente.nombre} ${paciente.apellido}`,
      DNI: paciente.dni,
      Fecha: t.fecha,
      Hora: t.hora,
      Especialidad: t.especialidad,
      Especialista: `${t.especialista?.nombre} ${t.especialista?.apellido}`,
      Estado: t.estado
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'TurnosPaciente');
    XLSX.writeFile(libro, `turnos_${paciente.apellido}_${paciente.dni}.xlsx`);
  }
}
