import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { AuthorListComponent } from './author-list/author-list.component';
import { EditorialListComponent } from './editorial-list/editorial-list.component';
import { BookListComponent } from './book-list/book-list.component';
import { RateListComponent } from './rate-list/rate-list.component';
import { LoanListComponent } from './loan-list/loan-list.component';
import { LoanEditComponent } from './loan-edit/loan-edit.component';

export const routes: Routes = [
    {
        path : '', 
        component : LoanListComponent,
        data : {
            title : 'Préstamos',
            breadcrumbs : ['Home', 'Préstamos']
        }
    },
    {
        path : 'loan/:id', 
        component : LoanEditComponent,
        data : {
            title : 'Préstamos',
            breadcrumbs : ['Home', 'Préstamos', 'Editar Préstamo']
        }
    },
    {
        path : 'users', 
        component : UserListComponent,
        data : {
            title : 'Usuarios',
            breadcrumbs : ['Home', 'Usuarios']
        }
    },
    {
        path : 'authors', 
        component : AuthorListComponent,
        data : {
            title : 'Autores',
            breadcrumbs : ['Home', 'Autores']
        }
    }, 
    {
        path : 'editoriales', 
        component : EditorialListComponent,
        data : {
            title : 'Editoriales',
            breadcrumbs : ['Home', 'Editoriales']
        }
    },
    {
        path : 'books', 
        component : BookListComponent,
        data : {
            title : 'Libros',
            breadcrumbs : ['Home', 'Libros']
        }
    },
    {
        path : 'rates', 
        component : RateListComponent,
        data : {
            title : 'Tarifas',
            breadcrumbs : ['Home', 'Tarifas']
        }
    },
    { path: '**', redirectTo: '' }
];
