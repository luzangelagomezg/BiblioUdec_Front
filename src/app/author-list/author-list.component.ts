import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Author, AuthorService } from '../services/author.service';

@Component({
  selector: 'app-author-list',
  imports: [CommonModule, FormsModule], 
  templateUrl: './author-list.component.html',
  styleUrl: './author-list.component.scss'
})
export class AuthorListComponent implements OnInit {

  authors: Author[] = [];

  constructor(private authorService: AuthorService) { }

  ngOnInit(): void {
    this.authorService.getAuthors().subscribe((data: Author[]) => {
      this.authors = data;
    });
  }

  addAuthor() {
    const nuevoAutor: Author = { id: '', name: '', editing: true };
    this.authors.unshift(nuevoAutor);
  }

  editAuthor(author: Author) {
    author.editing = true;
  }

  saveAuthor(author: Author) {
    console.log('Autor guardado:', author);
    if (author.id) {
      this.authorService.updateAuthor(author.id, author).subscribe(() => {
        console.log('Autor actualizado');
        author.editing = false;
      });
    } else {
      this.authorService.addAuthor(author).subscribe((newAuthor: Author) => {
        author.id = newAuthor.id;
        console.log('Autor creado:', newAuthor);
        author.editing = false;
      });
    }
  }

  cancelEdit(author: Author) {
    if (author.id) {
      author.editing = false;
    } else {
      this.authors.shift();
    }
  }

  removeAuthor(author: Author) {
    if (author.id) {
      this.authorService.deleteAuthor(author.id).subscribe(() => {
        console.log('Autor eliminado');
        author.editing = false;
        this.authors = this.authors.filter(a => a !== author);
      });
    }    
  }
}
