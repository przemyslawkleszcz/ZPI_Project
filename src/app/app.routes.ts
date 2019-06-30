import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { KanbanComponent } from './kanban/kanban.component';
import { KanbanBoardComponent } from './kanbanBoard/kanbanBoard.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { HomeComponent } from './home/home.component';
import { UserResolver } from './user/user.resolver';
import { AuthGuard } from './core/auth.guard';

export const rootRouterConfig: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, resolve: { data: UserResolver} },
  { path: 'kanban', component: KanbanComponent, resolve: { data: UserResolver} },
  { path: 'kanbanBoard/:id', component: KanbanBoardComponent, resolve: { data: UserResolver} },
  { path: 'statistics', component: StatisticsComponent, resolve: { data: UserResolver} }
];
