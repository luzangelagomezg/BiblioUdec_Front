import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Editorial {
  id: string;
  name: string;
  address: string;
  editing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EditorialService {
  private apiUrl = 'http://localhost:3000/api/v1/';
  constructor(private http: HttpClient) { }

  getEditorials() {
    return this.http.get<Editorial[]>(`${this.apiUrl}editorials`);
  }

  getEditorialById(id: string) {
    return this.http.get<Editorial>(`${this.apiUrl}editorials/${id}`);
  }

  addEditorial(editorial: Editorial) {
    const { id, editing, ...editorialData } = editorial;
    return this.http.post<Editorial>(`${this.apiUrl}editorials`, editorialData);
  }

  updateEditorial(id: string, editorial: Editorial) {
    const { editing, ...editorialData } = editorial;
    return this.http.put<Editorial>(`${this.apiUrl}editorials/${id}`, editorialData);
  }

  deleteEditorial(id: string) {
    return this.http.delete(`${this.apiUrl}editorials/${id}`);
  }
}
