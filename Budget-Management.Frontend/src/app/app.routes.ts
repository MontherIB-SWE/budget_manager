import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IncomeComponent } from './pages/income/income.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { AiSuggestionsComponent } from './pages/ai-suggestions/ai-suggestions.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'income', component: IncomeComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'ai-suggestions', component: AiSuggestionsComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
