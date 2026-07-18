import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeComponent: string = 'welcome';
  @Output() selectComponent = new EventEmitter<string>();

  menuItems = [
    { key: 'welcome', label: 'Dashboard Home' },
    { key: 'carousel', label: 'Image Carousel' },
    { key: 'autocomplete', label: 'Autocomplete Search' },
    { key: 'otp-input', label: 'OTP Input' }
  ];

  onSelect(key: string) {
    this.selectComponent.emit(key);
  }
}
