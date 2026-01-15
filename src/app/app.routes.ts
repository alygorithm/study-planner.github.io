import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path:'',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'planner',
    loadComponent: () => import('./pages/planner/planner.page').then(m => m.PlannerPage)
  },
  {
    path: 'focus',
    loadComponent: () => import('./pages/focus/focus.page').then( m => m.FocusPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.page').then( m => m.StatsPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];