import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | number, format: string = 'dd/MM/yyyy'): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    // Simple formatting: dd/MM/yyyy
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    if (format === 'dd/MM/yyyy') {
      return `${day}/${month}/${year}`;
    }
    // Add more formats if needed
    return date.toLocaleDateString();
  }
}
