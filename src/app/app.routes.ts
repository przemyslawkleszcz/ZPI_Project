import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { KanbanComponent } from './kanban/kanban.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { BurndownComponent } from './burndown/burndown.component';
import { UserResolver } from './user/user.resolver';
import { AuthGuard } from './core/auth.guard';

export const rootRouterConfig: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
  { path: 'kanban', component: KanbanComponent, resolve: { data: UserResolver} },
  { path: 'statistics', component: StatisticsComponent, resolve: { data: UserResolver} },
  { path: 'burndown', component: BurndownComponent, resolve: { data: UserResolver} },
  { path: 'user', component: UserComponent,  resolve: { data: UserResolver} }
];
