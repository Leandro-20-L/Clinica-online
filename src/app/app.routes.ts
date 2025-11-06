import { Routes } from '@angular/router';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { EncuestaTurnoComponent } from './components/encuesta-turno/encuesta-turno.component';
import { MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';

export const routes: Routes = [
    {
        path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
    },

    {
        path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'usuarios', loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    },
    {
        path: 'paciente', loadComponent: () => import('./components/dashboard-paciente/dashboard-paciente.component').then(m => m.DashboardPacienteComponent),
        children: [
                    
            { path: 'solicitar', component: SolicitarTurnoComponent }, 
            { path: 'perfil', component: PerfilComponent },             
            { path: 'encuesta/:id', component: EncuestaTurnoComponent },
            { path: 'turnos', component: MisTurnosComponent }
        ]
    },
    {
        path: 'bienvenida', loadComponent: () => import('./components/bienvenida/bienvenida.component').then(m => m.BienvenidaComponent)
    },
    {
         path: 'perfil', loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent),
    },

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    { path: '**', 
        redirectTo: 'login' 
    }
];
