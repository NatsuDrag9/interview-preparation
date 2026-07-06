import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImageCarouselComponent } from "./components/image-carousel/image-carousel.template";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, ImageCarouselComponent],
  template: `
    <h1>System Design - Angular</h1>
    <app-image-carousel [images]="sampleImages"></app-image-carousel>
  `,
  styles: [
    `
      h1 {
        text-align: center;
        font-family: Arial, sans-serif;
        color: #333;
        margin-bottom: 20px;
      }
    `,
  ],
})
export class AppComponent {
  sampleImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=600&h=400&fit=crop",
  ];
}
