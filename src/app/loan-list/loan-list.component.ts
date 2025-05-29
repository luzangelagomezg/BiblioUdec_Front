import { Component, OnInit } from '@angular/core';
import { DateFormatPipe } from './date-format.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Loan, LoanService } from '../services/loan.service';
import { Book } from '../services/book.service';

@Component({
  selector: 'app-loan-list',
  imports: [DateFormatPipe,CommonModule, FormsModule, RouterModule],
  templateUrl: './loan-list.component.html',
  styleUrl: './loan-list.component.scss'
})
export class LoanListComponent implements OnInit {

  constructor(
    private loanService: LoanService
  ){}


  loans: Loan[] = [];

  ngOnInit(): void {
    this.loadLoans();
  }
  loadLoans() {
    this.loanService.getLoans().subscribe(loans => {
      loans.forEach(loan => {
        loan.loanDate = this.isoToDateString(loan.loanDate);
        loan.expirationDate = this.isoToDateString(loan.expirationDate);
        loan.isActive = loan.isActive !== undefined ? loan.isActive : true;
      });
      this.loans = loans;
    });
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
}
