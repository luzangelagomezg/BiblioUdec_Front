import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Rate {
  id: string;
  description: string;
  value: number;
  editing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RateService {
  private apiUrl = 'http://localhost:3000/api/v1/';

  constructor(private http: HttpClient) { }

  getRates() {
    return this.http.get<any[]>(`${this.apiUrl}rates`);
  }

  getRateById(id: string) {
    return this.http.get<any>(`${this.apiUrl}rates/${id}`);
  }

  addRate(rate: any) {
    const { id, editing, ...rateData } = rate;
    return this.http.post<any>(`${this.apiUrl}rates`, rateData);
  }

  updateRate(id: string, rate: any) {
    const { editing, ...rateData } = rate;
    return this.http.put<any>(`${this.apiUrl}rates/${id}`, rateData);
  }

  deleteRate(id: string) {
    return this.http.delete(`${this.apiUrl}rates/${id}`);
  }
}
