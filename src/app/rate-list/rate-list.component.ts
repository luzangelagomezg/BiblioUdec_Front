import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rate, RateService } from '../services/rate.service';

@Component({
  selector: 'app-rate-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './rate-list.component.html',
  styleUrl: './rate-list.component.scss'
})
export class RateListComponent {

  rates: Rate[] = []

  constructor(private rateService: RateService) {}

  ngOnInit(): void {
    this.rateService.getRates().subscribe((data: Rate[]) => {
      this.rates = data;
    });
  }

  addRate() {
    const newRate = { id: '', description: '', value: 0, editing: true };
    this.rates.unshift(newRate);
  }

  editRate(rate: Rate) {
    rate.editing = true;
  }

  saveRate(rate: Rate) {
    console.log('Tarifa guardada:', rate);
    if (rate.id) {
      this.rateService.updateRate(rate.id, rate).subscribe(() => {
        console.log('Tarifa actualizada');
        rate.editing = false;
      });
    } else {
      this.rateService.addRate(rate).subscribe((newRate: Rate) => {
        rate.id = newRate.id;
        console.log('Tarifa creada:', newRate);
        rate.editing = false;
      });
    }
  }
  cancelEdit(rate: Rate) {
    if (rate.id) {
      rate.editing = false;
    } else {
      this.rates.shift();
    }
  }
  removeRate(rate: Rate) {
  if (rate.id) {
    this.rateService.deleteRate(rate.id).subscribe(() => {
      console.log('Tarifa eliminada');
      rate.editing = false;
      this.rates = this.rates.filter(r => r !== rate);
    });
  }
    
  }
}
