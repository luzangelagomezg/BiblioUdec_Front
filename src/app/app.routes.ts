import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { AuthorListComponent } from './author-list/author-list.component';
import { EditorialListComponent } from './editorial-list/editorial-list.component';
import { BookListComponent } from './book-list/book-list.component';
import { RateListComponent } from './rate-list/rate-list.component';
import { LoanListComponent } from './loan-list/loan-list.component';
import { LoanEditComponent } from './loan-edit/loan-edit.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        data: {
            title: 'Iniciar Sesión'
        }
    },
    {
        path : '', 
        component : LoanListComponent,
        canActivate: [authGuard],
        data : {
            title : 'Préstamos',
            breadcrumbs : ['Home', 'Préstamos']
        }
    },
    {
        path : 'loan/:id', 
        component : LoanEditComponent,
        canActivate: [authGuard],
        data : {
            title : 'Préstamos',
            breadcrumbs : ['Home', 'Préstamos', 'Editar Préstamo']
        }
    },
    {
        path : 'users', 
        component : UserListComponent,
        canActivate: [authGuard, roleGuard],
        data : {
            title : 'Usuarios',
            breadcrumbs : ['Home', 'Usuarios'],
            roles: ['admin']
        }
    },
    {
        path : 'authors', 
        component : AuthorListComponent,
        canActivate: [authGuard, roleGuard],
        data : {
            title : 'Autores',
            breadcrumbs : ['Home', 'Autores'],
            roles: ['admin']
        }
    }, 
    {
        path : 'editoriales', 
        component : EditorialListComponent,
        canActivate: [authGuard, roleGuard],
        data : {
            title : 'Editoriales',
            breadcrumbs : ['Home', 'Editoriales'],
            roles: ['admin']
        }
    },
    {
        path : 'books', 
        component : BookListComponent,
        canActivate: [authGuard, roleGuard],
        data : {
            title : 'Libros',
            breadcrumbs : ['Home', 'Libros'],
            roles: ['admin']
        }
    },
    {
        path : 'rates', 
        component : RateListComponent,
        canActivate: [authGuard, roleGuard],
        data : {
            title : 'Tarifas',
            breadcrumbs : ['Home', 'Tarifas'],
            roles: ['admin']
        }
    },
    { path: '**', redirectTo: '' }
];
