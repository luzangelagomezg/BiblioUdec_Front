import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Editorial, EditorialService } from '../services/editorial.service';

@Component({
  selector: 'app-editorial-list',
  imports: [CommonModule , FormsModule],
  templateUrl: './editorial-list.component.html',
  styleUrl: './editorial-list.component.scss'
})
export class EditorialListComponent implements OnInit {

  editorials: Editorial[] = []

  constructor(private editorialService: EditorialService) { }

  ngOnInit(): void {
    this.editorialService.getEditorials().subscribe((data: Editorial[]) => {
      this.editorials = data;
    });
  }

  addEditorial() {
    const nuevaEditorial = { id: '', name: '', address: '', editing: true };
    this.editorials.unshift(nuevaEditorial);
  }

  editEditorial(editorial: Editorial) {
    editorial.editing = true;
  }

  saveEditorial(editorial: Editorial) {
    console.log('Editorial guardada:', editorial);
    if (editorial.id) {
      this.editorialService.updateEditorial(editorial.id, editorial).subscribe(() => {
        console.log('Editorial actualizada');
        editorial.editing = false;
      });
    } else {
      this.editorialService.addEditorial(editorial).subscribe((newEditorial: Editorial) => {
        editorial.id = newEditorial.id;
        console.log('Editorial creada:', newEditorial);
        editorial.editing = false;
      });
    }
  }
  cancelEdit(editorial: Editorial) {
    if (editorial.id) {
      editorial.editing = false;
    } else {
      this.editorials.shift();
    }
  }
  removeEditorial(editorial: Editorial) {
  if (editorial.id) {
    this.editorialService.deleteEditorial(editorial.id).subscribe(() => {
      console.log('Editorial eliminada');
      editorial.editing = false;
      this.editorials = this.editorials.filter(e => e !== editorial);
    });
  }
}
}