import { useEffect, useState } from "react";
import "./ImageCarousel.css";

function ImageCarousel({ images = [], autoplayInterval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateTransition = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    if (!isAutoplay || images.length === 0) return;
    const interval = setInterval(() => {
      goToNext();
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoplayInterval]);

  const goToNext = () => {
    animateTransition();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    animateTransition();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    animateTransition();
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return <div className="image-carousel">No images available</div>;
  }

  return (
    <div className="image-carousel">
      {/* Navigation buttons */}
      <button
        type="button"
        className="navigation-button__prev"
        onClick={goToPrev}
      >
        &lt;
      </button>
      <button
        type="button"
        className="navigation-button__next"
        onClick={goToNext}
      >
        &gt;
      </button>

      {/* Image container */}
      <div className="image-container">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="carousel-image"
          style={{ opacity: isAnimating ? 0.7 : 1 }}
        />
      </div>

      {/* Indicator dots */}
      <div className="indicators">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;
