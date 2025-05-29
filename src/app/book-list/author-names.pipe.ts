import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'authorNames', standalone: true })
export class AuthorNamesPipe implements PipeTransform {
  transform(authors: Array<{ id: string; name: string }>): string {
    if (!authors || !Array.isArray(authors)) return '';
    return authors.map(a => a.name).join(', ');
  }
}
