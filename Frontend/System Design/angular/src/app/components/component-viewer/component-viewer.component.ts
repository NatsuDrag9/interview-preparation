import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCarouselComponent } from '../image-carousel/image-carousel.template';
import { AutocompleteSearch } from '../autocomplete-search/autocomplete-search.component';
import { OtpInput } from '../otp-input/otp-input.component';

interface ComponentInfo {
  title: string;
  difficulty: string;
  status: string;
  requirements: string[];
}

@Component({
  selector: 'app-component-viewer',
  standalone: true,
  imports: [CommonModule, ImageCarouselComponent, AutocompleteSearch, OtpInput],
  templateUrl: './component-viewer.component.html',
  styleUrls: ['./component-viewer.component.css']
})
export class ComponentViewerComponent {
  @Input() activeComponent: string = '';

  SAMPLE_IMAGES = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop"
  ];

  get componentInfo(): ComponentInfo | null {
    switch (this.activeComponent) {
      case 'carousel':
        return {
          title: 'Image Carousel',
          difficulty: 'Easy - Medium',
          status: 'Interactive Demo',
          requirements: [
            "Render list of images with back/next controls",
            "Autoplay with custom intervals",
            "Show progress dot indicators below carousel",
            "Handle transition animations smoothly",
            "Support looping back to start/end"
          ]
        };
      case 'autocomplete':
        return {
          title: 'Autocomplete Search',
          difficulty: 'Medium - Hard',
          status: 'Interactive Demo',
          requirements: [
            "Perform client-side query matching against dataset",
            "Debounced filtering and search suggestions list",
            "Highlight matching characters in search results",
            "Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)",
            "Outside click detection to dismiss dropdown results",
            "Cache search query results locally to minimize API requests"
          ]
        };
      case 'otp-input':
        return {
          title: 'OTP Input',
          difficulty: 'Easy - Medium',
          status: 'Interactive Demo',
          requirements: [
            "Render configurable number of input fields (typically 4 or 6)",
            "Support auto-focus on load, and auto-focus next on input",
            "Handle backspace/delete to move focus to the previous input",
            "Allow pasting full OTP code across fields",
            "Ensure numeric-only validation if configured"
          ]
        };
      default:
        return null;
    }
  }
}
