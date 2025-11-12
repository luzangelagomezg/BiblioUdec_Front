import { Injectable } from '@angular/core';
import { Author } from './author.service';
import { Editorial } from './editorial.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Book {
  id: string;
  name: string;
  isbn: string;
  year: number;
  authors: Author[];
  editorial: Editorial;
  editing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) { }

  getBooks() {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBookById(id: string) {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  createBook(book: Book) {
    const { id, editing, ...bookData } = book;
    return this.http.post<Book>(this.apiUrl, bookData);
  }

  updateBook(book: Book) {
    const { id, editing,authors,editorial, ...bookData } = book;
    return this.http.put<Book>(`${this.apiUrl}/${id}`, bookData);
  }

  associateAuthorsToBook(bookId: string, authors: Author[]) {
    return this.http.put(`${this.apiUrl}/${bookId}/authors`, authors);
  }

  associateEditorialToBook(bookId: string, editorial: Editorial) {
    return this.http.put(`${this.apiUrl}/${bookId}/editorial/${editorial.id}`, '');
  }

  deleteBook(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
