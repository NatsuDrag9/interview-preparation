import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";

@Component({
  selector: "app-image-carousel",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./image-carousel.template.html",
  styleUrls: ["./image-carousel.style.css"],
})
export class ImageCarouselComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() autoplayInterval = 3000;

  currentIndex = 0;
  isAutoplay = true;
  isAnimating = false;
  private autoPlayTimer: any;

  ngOnInit(): void {
    // Start autoplay
    this.autoPlayTimer = setInterval(() => {
      this.goToNext();
    }, this.autoplayInterval);
  }

  private animateTransition() {
    this.isAnimating = true;
    setTimeout(() => {
      this.isAnimating = false;
    }, 600);
  }

  goToNext() {
    this.animateTransition();
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  goToPrevious() {
    this.animateTransition();
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  goToSlide(index: number) {
    this.animateTransition();
    this.currentIndex = index;
  }

  private stopAutoplay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  ngOnDestroy(): void {
    // Cleanup timer
    this.stopAutoplay();
  }
}
