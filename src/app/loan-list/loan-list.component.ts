import { Component, OnInit } from '@angular/core';
import { DateFormatPipe } from './date-format.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Loan, LoanService } from '../services/loan.service';
import { Book } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { Rate, RateService } from '../services/rate.service';

@Component({
  selector: 'app-loan-list',
  imports: [DateFormatPipe,CommonModule, FormsModule, RouterModule],
  templateUrl: './loan-list.component.html',
  styleUrl: './loan-list.component.scss'
})
export class LoanListComponent implements OnInit {
  loans: Loan[] = [];
  isAdmin: boolean = false;
  currentUserId: string = '';
  
  // Para el modal de aprobación
  selectedLoan: Loan | null = null;
  rates: Rate[] = [];
  selectedRateId: string = '';
  showApprovalModal: boolean = false;

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private rateService: RateService
  ){}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';
    this.currentUserId = currentUser?.sub || '';
    
    this.loadLoans();
    
    if (this.isAdmin) {
      this.loadRates();
    }
  }
  loadLoans() {
    if (this.isAdmin) {
      // Admin: cargar todos los préstamos
      this.loanService.getLoans().subscribe(loans => {
        this.processLoans(loans);
      });
    } else {
      // Usuario: cargar solo sus préstamos
      this.loanService.getLoansByUser(this.currentUserId).subscribe(loans => {
        this.processLoans(loans);
      });
    }
  }

  loadRates() {
    this.rateService.getRates().subscribe(rates => {
      this.rates = rates;
    });
  }

  processLoans(loans: Loan[]) {
    loans.forEach(loan => {
      loan.loanDate = this.isoToDateString(loan.loanDate);
      loan.expirationDate = this.isoToDateString(loan.expirationDate);
      loan.isActive = loan.isActive !== undefined ? loan.isActive : true;
      loan.status = loan.status || 'creado';
    });
    this.loans = loans;
  }

  addLoan() {
  }
  editLoan(loan: any) {
    loan.editing = true;
  }
  saveLoan(loan: any) {
    console.log('Préstamo guardado:', loan);
    loan.editing = false;
  }
  cancelEdit(loan: any) {
    if (loan.id) {
      loan.editing = false;
    } else {
      this.loans.shift();
    }
  }
  removeLoan(loan: any) {
    if(loan.id) {
      this.loanService.deleteLoan(loan.id).subscribe(() => {
        console.log('Préstamo eliminado:', loan);
        this.loans = this.loans.filter(l => l !== loan);
      });
    }

  }

  viewLoan(loan: any) {
    console.log('Detalles del préstamo:', loan);
    alert(`Detalles del préstamo:\nUsuario: ${loan.user.name}\nLibro: ${loan.books.map((b: Book) => b.name).join(', ')}\nTarifa: ${loan.rate.description}\nFecha de préstamo: ${loan.loanDate}\nFecha de vencimiento: ${loan.expirationDate}`); 
  }
  getTotalLoanValue(loan: any): number {
    const start = new Date(loan.loanDate);
    const end = new Date(loan.expirationDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const bookCount = Array.isArray(loan.books) ? loan.books.length : 1;
    const rateValue = loan.rate && loan.rate.value ? loan.rate.value : 0;
    return diffDays * bookCount * rateValue;
  }

  isoToDateString(iso: string): string {
    if (!iso) return '';
    // Asegura que no haya desfase de zona horaria
    return iso.split('T')[0];
  }

  returnLoan(loan: any) {
    loan.isActive = false;
    loan.expirationDate = this.isoToDateString(new Date().toISOString()); 
    this.loanService.updateLoan(loan).subscribe(() => {
      console.log('Préstamo actualizado:', loan);
    });
  }

  // Métodos para admin
  openApprovalModal(loan: Loan) {
    this.selectedLoan = loan;
    this.selectedRateId = loan.rate?.id || '';
    this.showApprovalModal = true;
  }

  closeApprovalModal() {
    this.showApprovalModal = false;
    this.selectedLoan = null;
    this.selectedRateId = '';
  }

  approveLoan() {
    if (!this.selectedLoan || !this.selectedRateId) {
      alert('Por favor seleccione una tarifa');
      return;
    }

    this.loanService.approveLoan(this.selectedLoan.id, this.selectedRateId).subscribe(() => {
      console.log('Préstamo aprobado');
      this.closeApprovalModal();
      this.loadLoans();
    });
  }

  rejectLoan(loan: Loan) {
    if (confirm('¿Está seguro que desea rechazar este préstamo?')) {
      this.loanService.rejectLoan(loan.id).subscribe(() => {
        console.log('Préstamo rechazado');
        this.loadLoans();
      });
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'aprobado': return 'badge-success';
      case 'rechazado': return 'badge-danger';
      case 'creado': return 'badge-warning';
      case 'finalizado': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status?: string): string {
    switch (status) {
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      case 'creado': return 'Creado';
      case 'finalizado': return 'Finalizado';
      default: return 'Desconocido';
    }
  }
}
