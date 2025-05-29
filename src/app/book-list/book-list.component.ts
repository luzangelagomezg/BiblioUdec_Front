import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthorNamesPipe } from './author-names.pipe';
import { Author, AuthorService } from '../services/author.service';
import { Editorial, EditorialService } from '../services/editorial.service';
import { Book, BookService } from '../services/book.service';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, FormsModule, AuthorNamesPipe],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent implements OnInit {

  constructor(
    private authorService: AuthorService, 
    private editorialService: EditorialService, 
    private bookService: BookService
  ) { }
 
  allAuthors: Author[] = [];

  allEditorials: Editorial[] = [];

  books: Book[] = [];

  ngOnInit(): void {
    this.loadAuthors();
    this.loadEditorials();
    this.loadBooks();
  }
  loadBooks() {
    this.bookService.getBooks().subscribe(books => {
      this.books = books;
    });
  }

  loadEditorials() {
    this.editorialService.getEditorials().subscribe(editorials => {
      this.allEditorials = editorials;
    });
  }

  loadAuthors() {
    this.authorService.getAuthors().subscribe(authors => {
      this.allAuthors = authors;
    });
  }

  addBook() {
    const newEditorial: Editorial = { id: '', name: '' , address: ''};
    const newBook: Book = { id: '', name: '', authors: [], editorial: newEditorial, isbn: '', year: 0, editing: true };
    this.books.unshift(newBook);
  }

  editBook(book: Book) {
    book.editing = true;
  }

  saveBook(book: Book) {
    console.log('Libro guardado:', book);
    if (book.id) {
      this.bookService.updateBook(book).subscribe(() => {
        console.log('Libro actualizado');
        this.bookService.associateAuthorsToBook(book.id, book.authors).subscribe(() => {
          console.log('Autores asociados al libro');
        });
        this.bookService.associateEditorialToBook(book.id, book.editorial).subscribe(() => {
          console.log('Editorial asociada al libro');
        });
        book.editing = false;
      });
    } else {
      this.bookService.createBook(book).subscribe((newBook: Book) => {
        book.id = newBook.id;
        console.log('Libro creado:', newBook);
          this.bookService.associateAuthorsToBook(book.id, book.authors).subscribe(() => {
          console.log('Autores asociados al libro');
        });
        this.bookService.associateEditorialToBook(book.id, book.editorial).subscribe(() => {
          console.log('Editorial asociada al libro');
        });
        book.editing = false;
      });
    }

    book.editing = false;
  }

  cancelEdit(book: Book) {
    if (book.id) {
      book.editing = false;
    } else {
      this.books.shift();
    }
  }

  removeBook(book: Book) {
  if (book.id) {
    this.bookService.deleteBook(book.id).subscribe(() => {
      console.log('Libro eliminado');
      book.editing = false;
      this.books = this.books.filter(b => b !== book);
    });
  }
  }
}
