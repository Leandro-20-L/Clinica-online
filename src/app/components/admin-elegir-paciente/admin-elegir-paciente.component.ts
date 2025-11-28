import { Component } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SlideUpDirective } from '../../directivas/slide-up.directive';

@Component({
  selector: 'app-admin-elegir-paciente',
  imports: [CommonModule, SlideUpDirective],
  templateUrl: './admin-elegir-paciente.component.html',
  styleUrl: './admin-elegir-paciente.component.scss'
})
export class AdminElegirPacienteComponent {
   pacientes: any[] = [];

  constructor(private usuariosService: UsuariosService,
              private router: Router) {}

  async ngOnInit() {
    const todos = await this.usuariosService.obtenerTodos();
    this.pacientes = todos.filter(u => u.rol === 'paciente');
  }

  SolicitarTurno(paciente: any) {
    this.router.navigate(['/solicitar-turno', paciente.id]);
  }
}
