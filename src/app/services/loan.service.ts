import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from './book.service';
import { User } from './user.service';
import { Rate } from './rate.service';

export interface Loan {
  id: string,
  loanDate: string,
  expirationDate: string,
  isActive: boolean,
  status?: 'creado' | 'aprobado' | 'rechazado' | 'finalizado',
  books: Book[],
  user: User,
  rate?: Rate
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:3000/api/v1/loans';

  constructor(private http: HttpClient) { }

  getLoans() {
    return this.http.get<Loan[]>(this.apiUrl);
  }

  getLoansByUser(userId: string) {
    return this.http.get<Loan[]>(`${this.apiUrl}/user/${userId}`);
  }

  getLoanById(id: string) {
    return this.http.get<Loan>(`${this.apiUrl}/${id}`);
  }

  createLoan(loan: Loan) {
    const { id, ...loanData } = loan;
    return this.http.post<Loan>(this.apiUrl, loanData);
  }

  updateLoan(loan: Loan) {
    const { id, books,user,rate, ...loanData } = loan;
    return this.http.put<Loan>(`${this.apiUrl}/${id}`, loanData);
  }

  associateBooksToLoan(loanId: string, books: Book[]) {
    return this.http.put(`${this.apiUrl}/${loanId}/books`, books);
  }

  associateUserToLoan(loanId: string, user: User) {
    return this.http.put(`${this.apiUrl}/${loanId}/users/${user.id}`, '');
  }

  associateRateToLoan(loanId: string, rate: Rate) {
    return this.http.put(`${this.apiUrl}/${loanId}/rates/${rate.id}`, '');
  }

  deleteLoan(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  approveLoan(loanId: string, rateId: string) {
    return this.http.post(`${this.apiUrl}/${loanId}/approve`, { rateId });
  }

  rejectLoan(loanId: string) {
    return this.http.post(`${this.apiUrl}/${loanId}/reject`, {});
  }
}
