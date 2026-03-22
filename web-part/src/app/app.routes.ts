import { Routes } from '@angular/router';

/**
 * 根路由配置
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    title: '吃了么 - 智能美食推荐'
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    title: '设置 - 吃了么'
  },
  {
    path: 'history',
    loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent),
    title: '历史记录 - 吃了么'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
