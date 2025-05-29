import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Author {
  id: string;
  name: string;
  editing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private apiUrl = 'http://localhost:3000/api/v1/';
  constructor(private http: HttpClient) { }

  getAuthors() {
    return this.http.get<Author[]>(`${this.apiUrl}authors`);
  }

  getAuthorById(id: string) {
    return this.http.get<Author>(`${this.apiUrl}authors/${id}`);
  }

  addAuthor(author: Author) {
    const { id, editing, ...authorData } = author;
    return this.http.post<Author>(`${this.apiUrl}authors`, authorData);
  }

  updateAuthor(id: string, author: Author) {
    const { editing, ...authorData } = author;
    return this.http.put<Author>(`${this.apiUrl}authors/${id}`, authorData);
  }

  deleteAuthor(id: string) {
    return this.http.delete(`${this.apiUrl}authors/${id}`);
  }
}
