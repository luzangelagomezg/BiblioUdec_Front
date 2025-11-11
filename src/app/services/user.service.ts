import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: string;
  editing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/v1/';
  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get<User[]>(`${this.apiUrl}users`);
  }

  getUserById(id: string) {
    return this.http.get<User>(`${this.apiUrl}users/${id}`);
  }

  addUser(user: User) {
    const { id, editing, ...userData } = user;
    return this.http.post<User>(`${this.apiUrl}users`, userData);
  }

  updateUser(id: string, user: User) {
    const { editing, ...userData } = user;
    return this.http.put<User>(`${this.apiUrl}users/${id}`, userData);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}users/${id}`);
  }
}
