import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: ` <h1>System Design - Angular</h1> `,
  styles: [
    `
      h1 {
        text-align: center;
        font-family: Arial, sans-serif;
        color: #333;
      }
    `,
  ],
})
export class AppComponent {
  sampleImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
  ];
}
