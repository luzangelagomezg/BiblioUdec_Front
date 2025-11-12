import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { User, UserService } from '../services/user.service';
import { Book, BookService } from '../services/book.service';
import { Rate, RateService } from '../services/rate.service';
import { Loan, LoanService } from '../services/loan.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { forkJoin, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-loan-edit',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './loan-edit.component.html',
  styleUrls: ['./loan-edit.component.scss']
})
export class LoanEditComponent implements OnInit {

  loanId!: string;
  isNewLoan: boolean = false;
  userId:string = '';
  isAdmin: boolean = false;
  currentUserId: string = '';

  loan!: Loan;
  users: User[] = [];
  books: Book[] = [];
  rates: Rate[] = [];

  usersLoaded = false;
  booksLoaded = false;
  ratesLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private loanService: LoanService, 
    private userService: UserService,
    private bookService: BookService,
    private rateService: RateService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // Determinar rol y usuario actual
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';
    this.currentUserId = currentUser?.sub || '';

    // Cargar datos necesarios
    //if (this.isAdmin) {
    await this.loadUsers();
    await this.loadRates();
    //}
    await this.loadBooks();

    this.loanId = this.route.snapshot.paramMap.get('id') || '';
    if (this.loanId === '0') {
      this.isNewLoan = true;
      const newLoan: Loan = { 
        id: '', 
        loanDate: new Date().toISOString().slice(0, 10), 
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        isActive: true,
        books: [],
        user: {id: this.currentUserId, name:'', phone:'', email:''},
        rate: {id:'', description:'', value:0},
        status: 'creado'
      };
      this.loan = newLoan;
      
      // Si no es admin, cargar info del usuario actual
      /*if (!this.isAdmin) {
        const user = await lastValueFrom(this.userService.getUserById(this.currentUserId));
        this.loan.user = user;
      }*/
      this.trySyncLoan();
    }
    else {
      const loan = await lastValueFrom(this.loanService.getLoanById(this.loanId));
      loan.loanDate = this.isoToDateString(loan.loanDate);
      loan.expirationDate = this.isoToDateString(loan.expirationDate);
      this.loan = loan;

    }

  }

  async loadRates(): Promise<void> {
    this.rates = await lastValueFrom(this.rateService.getRates());
    this.ratesLoaded = true;
    
  }
  
  async loadBooks(): Promise<void> {
    this.books = await lastValueFrom(this.bookService.getBooks());
    this.booksLoaded = true;

  }
  
  async loadUsers(): Promise<void> {
    this.users = await lastValueFrom(this.userService.getUsers());
    this.usersLoaded = true;

  }

  saveLoan(loan: Loan){
    console.log(loan);
    
    // Preparar el loan según el rol
    let loanToSend = { ...loan };
    
    if (!this.isAdmin) {
      // Si no es admin, forzar el usuario actual y estado creado
      if (loan.user) {
        loanToSend.user = { ...loan.user, id: this.currentUserId };
      }
      loanToSend.status = 'creado';
      // Eliminar el rate completamente del objeto a enviar
      delete (loanToSend as any).rate;
    }
    
    if(!loan.id) {
      // Crear nuevo préstamo
      this.loanService.createLoan(loanToSend).subscribe((newLoan: Loan) =>{
        console.log('loan creado');
        loan.id = newLoan.id;
        
        const associations = [
          this.loanService.associateBooksToLoan(loan.id, loan.books)
        ];
        
        // Asociar usuario si existe
        if (loan.user) {
          associations.push(this.loanService.associateUserToLoan(loan.id, loan.user));
        }
        
        // Solo asociar tarifa si es admin y tiene tarifa
        if (this.isAdmin && loan.rate?.id) {
          associations.push(this.loanService.associateRateToLoan(loan.id, loan.rate));
        }
        
        forkJoin(associations).subscribe(() => {
          console.log('Todas las asociaciones completadas');
          window.location.href = '/loans';
        });
      });
    } else {
      // Actualizar préstamo existente
      this.loanService.updateLoan(loanToSend).subscribe((updatedLoan: Loan) =>{
        console.log('loan actualizado');
        
        const associations = [
          this.loanService.associateBooksToLoan(loan.id, loan.books)
        ];
        
        // Asociar usuario si existe
        if (loan.user) {
          associations.push(this.loanService.associateUserToLoan(loan.id, loan.user));
        }
        
        // Solo asociar tarifa si es admin y tiene tarifa
        if (this.isAdmin && loan.rate?.id) {
          associations.push(this.loanService.associateRateToLoan(loan.id, loan.rate));
        }
        
        forkJoin(associations).subscribe(() => {
          console.log('Todas las asociaciones completadas');
          window.location.href = '/loans';
        });
      });
    }
  }

  private syncLoanReferences() {
    if (this.loan) {
      // Solo sincronizar si es admin y hay datos cargados
      if (this.isAdmin && this.users.length && this.rates.length && this.books.length) {
        // Sincroniza user
        this.loan.user = this.users.find(u => u.id === this.loan.user?.id) || {id:'',name:'',phone:'',email:''};
        // Sincroniza rate
        this.loan.rate = this.rates.find(r => r.id === this.loan.rate?.id) || {id:'',description:'',value:0};
        // Sincroniza books
        this.loan.books = this.loan.books
          .map(b => this.books.find(book => book.id === b.id))
          .filter(b => !!b) as Book[];
      } else if (!this.isAdmin && this.books.length) {
         this.loan.user = this.users.find(u => u.id === this.loan.user?.id) || {id:'',name:'',phone:'',email:''};
        // Para usuarios normales, solo sincronizar books
        this.loan.books = this.loan.books
          .map(b => this.books.find(book => book.id === b.id))
          .filter(b => !!b) as Book[];
      }
    }
  }

  private trySyncLoan() {
    if (this.isAdmin && this.usersLoaded && this.booksLoaded && this.ratesLoaded && this.loan) {
      this.syncLoanReferences();
    } else if (!this.isAdmin && this.booksLoaded && this.loan) {
      this.syncLoanReferences();
    }
  }

  isoToDateString(iso: string): string {
    return iso ? iso.substring(0, 10) : '';
  }


}
