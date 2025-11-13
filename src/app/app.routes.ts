import { Routes } from '@angular/router';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';

export const routes: Routes = [
      {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'seccion-paciente',
    loadComponent: () => import('./components/seccion-paciente/seccion-paciente.component').then(m => m.SeccionPacienteComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    children: [
      // acá podrías agregar la nueva ruta del admin para sacar turnos a pacientes
      { path: 'solicitar/:idPaciente', component: SolicitarTurnoComponent }
    ]
  },
  {
    path: 'especialista',
    loadComponent: () => import('./components/dashboard-especialista/dashboard-especialista.component').then(m => m.DashboardEspecialistaComponent)
  },
  {
    path: 'alta-admin',
    loadComponent: () => import('./components/nuevo-admin/nuevo-admin.component').then(m => m.NuevoAdminComponent)
  },
  {
    path: 'paciente',
    loadComponent: () => import('./components/dashboard-paciente/dashboard-paciente.component').then(m => m.DashboardPacienteComponent)
  },
  { path: 'paciente/solicitar', component: SolicitarTurnoComponent },
  { path: 'paciente/turnos', component: MisTurnosComponent },
  
  { path: 'perfil', component: PerfilComponent },
  {
    path: 'bienvenida',
    loadComponent: () => import('./components/bienvenida/bienvenida.component').then(m => m.BienvenidaComponent)
  },
    {
        path: '',
        redirectTo: 'bienvenida',
        pathMatch: 'full'
    },
    { path: '**', 
        redirectTo: 'bienvenida' 
    }
];
