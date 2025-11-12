import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { User, UserService } from '../services/user.service';
import { Book, BookService } from '../services/book.service';
import { Rate, RateService } from '../services/rate.service';
import { Loan, LoanService } from '../services/loan.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

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
    if (this.isAdmin) {
      this.loadUsers();
      this.loadRates();
    }
    this.loadBooks();

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
      if (!this.isAdmin) {
        this.userService.getUserById(this.currentUserId).subscribe(user => {
          this.loan.user = user;
        });
      }
    }
    else {
      this.loanService.getLoanById(this.loanId).subscribe(loan => {
        loan.loanDate = this.isoToDateString(loan.loanDate);
        loan.expirationDate = this.isoToDateString(loan.expirationDate);
        this.loan = loan;
        this.trySyncLoan();
      })
    }

  }

  loadRates(): void {
    this.rateService.getRates().subscribe(rates => {
      this.rates = rates;
      this.ratesLoaded = true;
      this.trySyncLoan();
    });
  }
  
  loadBooks(): void {
    this.bookService.getBooks().subscribe(books => {
      this.books = books;
      this.booksLoaded = true;
      this.trySyncLoan();
    });
  }
  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.usersLoaded = true;
      this.trySyncLoan();
    });
  }

  saveLoan(loan: Loan){
    console.log(loan);
    
    // Preparar el loan según el rol
    let loanToSend = { ...loan };
    
    if (!this.isAdmin) {
      // Si no es admin, forzar el usuario actual y estado creado
      loanToSend.user = { ...loan.user, id: this.currentUserId };
      loanToSend.status = 'creado';
      // Eliminar el rate completamente del objeto a enviar
      delete (loanToSend as any).rate;
    }
    
    if(!loan.id) {
      this.loanService.createLoan(loanToSend).subscribe((newLoan: Loan) =>{
        console.log('loan creado');
        loan.id = newLoan.id;
        this.loanService.associateBooksToLoan(loan.id,loan.books).subscribe(()=> {
          console.log('libros asociados al prestamo');
        })
        this.loanService.associateUserToLoan(loan.id,loan.user).subscribe(()=>{
          console.log('usuario asociado al prestamo');
        })
        
        // Solo asociar tarifa si es admin y tiene tarifa
        if (this.isAdmin && loan.rate?.id) {
          this.loanService.associateRateToLoan(loan.id,loan.rate).subscribe(()=>{
            console.log('tarifa asociada al prestamo');
          })
        }
        window.location.href = '/loans';
      });
    } else {
      this.loanService.updateLoan(loanToSend).subscribe((newLoan: Loan) =>{
        console.log('loan actualizado');
        loan.id = newLoan.id;
        this.loanService.associateBooksToLoan(loan.id,loan.books).subscribe(()=> {
          console.log('libros asociados al prestamo');
        })
        this.loanService.associateUserToLoan(loan.id,loan.user).subscribe(()=>{
          console.log('usuario asociado al prestamo');
        })
        
        // Solo asociar tarifa si es admin y tiene tarifa
        if (this.isAdmin && loan.rate?.id) {
          this.loanService.associateRateToLoan(loan.id,loan.rate).subscribe(()=>{
            console.log('tarifa asociada al prestamo');
          })
        }
        window.location.href = '/loans';
      });
    }
  }

  private syncLoanReferences() {
    if (this.loan && this.users.length && this.rates.length && this.books.length) {
      // Sincroniza user
      this.loan.user = this.users.find(u => u.id === this.loan.user?.id) || {id:'',name:'',phone:'',email:''};
      // Sincroniza rate
      this.loan.rate = this.rates.find(r => r.id === this.loan.rate?.id) || {id:'',description:'',value:0};
      // Sincroniza books
      this.loan.books = this.loan.books
        .map(b => this.books.find(book => book.id === b.id))
        .filter(b => !!b) as Book[];
    }
  }

  private trySyncLoan() {
    if (this.usersLoaded && this.booksLoaded && this.ratesLoaded && this.loan) {
      this.syncLoanReferences();
    }
  }

  isoToDateString(iso: string): string {
    return iso ? iso.substring(0, 10) : '';
  }


}
