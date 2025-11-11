import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/v1'; // Cambiar según tu configuración
  private tokenKey = 'access_token';
  private currentUserSubject = new BehaviorSubject<DecodedToken | null>(this.getUserFromToken());

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.setToken(response.access_token);
          this.currentUserSubject.next(this.getUserFromToken());
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const decoded = this.decodeToken(token);
    if (!decoded) {
      return false;
    }

    // Verificar si el token ha expirado
    const now = Date.now() / 1000;
    return decoded.exp > now;
  }

  getUserFromToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log('Decoded token:', decoded);
      return decoded as DecodedToken;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getCurrentUser(): DecodedToken | null {
    return this.currentUserSubject.value;
  }

  getUserDetails(userId: string): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.baseUrl}/users/${userId}`);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  isUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'user';
  }
}
