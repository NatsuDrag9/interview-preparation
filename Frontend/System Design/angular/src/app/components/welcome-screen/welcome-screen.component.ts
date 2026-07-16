import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.css']
})
export class WelcomeScreenComponent {
  @Output() selectComponent = new EventEmitter<string>();

  cards = [
    {
      key: 'carousel',
      title: 'Image Carousel',
      desc: 'An interactive, responsive image slider featuring automatic rotation, custom interval controls, transitions, and dot indicators.'
    },
    {
      key: 'autocomplete',
      title: 'Autocomplete Search',
      desc: 'A search-as-you-type autocomplete input component featuring matched text highlighting, dropdown suggestions, and keyboard arrow key navigation.'
    }
  ];

  onSelect(key: string) {
    this.selectComponent.emit(key);
  }
}
