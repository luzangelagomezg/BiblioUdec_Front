import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { User, UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {

users: User[] = []

constructor(private userService: UserService) { }

ngOnInit(): void {
  this.userService.getUsers().subscribe((data: User[]) => {
    this.users = data;
  });
}


addUser() {
  const nuevoUsuario: User = this.EmptyUser();
  this.users.unshift(nuevoUsuario);
}

editUser(user: User) {
  user.editing = true;
}

saveUser(user: User) {
  console.log('Usuario guardado:', user);
  if (user.id) {
    this.userService.updateUser(user.id, user).subscribe(() => {
      console.log('Usuario actualizado');
      user.editing = false;
    });
  } else {
    this.userService.addUser(user).subscribe((newUser: User) => {
      user.id = newUser.id;
      console.log('Usuario creado:', newUser);
      user.editing = false;
    });
  }
  
}

cancelEdit(user: User) {
  if (user.id) {
    user.editing = false;
  } else {
    this.users.shift();
  }
}

removeUser(user: User) {
  if (user.id) {
    this.userService.deleteUser(user.id).subscribe(() => {
      console.log('Usuario eliminado');
      user.editing = false;
      this.users = this.users.filter(u => u !== user);
    });
  }  
}

private EmptyUser(): User {
    return {
      id: '',
      name: '',
      email: '',
      phone: '',
      editing: true
    };
}

}
