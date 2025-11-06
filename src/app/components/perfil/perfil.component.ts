import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  @Input() usuario: any = null;
  rol: string = '';

  constructor(
    private auth: AuthService, 
    private usuariosService: UsuariosService,
    private router: Router) {}

  async ngOnInit() {
    if (!this.usuario) {
      const uid = await this.auth.getUserUid();
      this.usuario = await this.usuariosService.obtenerPorUID(uid!);
    }

    
    this.rol = this.usuario?.rol || 'paciente';
  }


  volver() {
  this.router.navigate(['/paciente']); 
}
}
