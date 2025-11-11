import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService, DecodedToken } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '';
  breadcrumbs: string[] = [];
  currentUser: DecodedToken | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
     this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let currentRoute = this.route.root;
          while (currentRoute.firstChild) {
            currentRoute = currentRoute.firstChild;
          }
          return currentRoute.snapshot.data;
        })
      )
      .subscribe(data => {
        this.title = data['title'] || 'bibloteca UDEC';
        this.breadcrumbs = data['breadcrumbs'] || [];
      });

    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
