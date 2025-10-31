import { Routes } from '@angular/router';

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
        path: 'dashboard-paciente', loadComponent: () => import('./components/dashboard-paciente/dashboard-paciente.component').then(m => m.DashboardPacienteComponent)
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
