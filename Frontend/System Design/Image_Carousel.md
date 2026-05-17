# Frontend System Design: Image Carousel (Interview-Ready)

## Problem Statement
Design an image carousel component that:
- Displays a list of images
- Supports navigation via buttons and pagination
- Optionally supports autoplay

---

## 1. Requirements

### Functional
- Display one image at a time
- Navigate via:
  - Previous / Next buttons
  - Pagination dots
  - Keyboard (← →)
  - Touch (swipe gestures)
- Optional autoplay
- Pause or reset autoplay on user interaction

### Non-Functional
- Smooth transitions (slide/fade)
- Responsive (mobile + desktop)
- Accessible (keyboard + screen readers)
- Efficient image loading

---

## 2. High-Level Approach

- Maintain a single source of truth: `currentIndex`
- Render image based on index
- Update index via:
  - User interaction (buttons, swipe, keyboard)
  - Autoplay timer

---

## 3. Data Model

```ts
interface Image {
  id: string;
  url: string;
  alt: string;
}
```

---

## 4. Component Architecture

* `Carousel` (container) 
   - Manages state and logic 
* `ImageWrapper` 
   - Displays current image 
* `NavigationButton` 
   - Previous / Next buttons 
* `PaginationDots` 
   - Jump to specific index 

---

## 5. State Management

### Core State

* `currentIndex: number` 
* `images: Image[]` 

### UI State

* `isAutoplay: boolean` 
* `isHovered / isFocused: boolean` (pause autoplay) 

---

## 6. Data Flow

```
User interaction / autoplay → update index → render image
```

### Navigation Logic

```
Next → (index + 1) % images.length  
Prev → (index - 1 + images.length) % images.length
```

---

## 7. Autoplay Behavior

* Use `setInterval` to update index periodically 
* Cleanup interval on: 
  * Component unmount 
  * Dependency changes 
* Pause or reset autoplay when: 
  * User interacts (click, swipe, keyboard) 
  * User hovers or focuses 

---

## 8. Performance Optimizations

* Lazy load images 
* Preload: 
  * Current image 
  * Next image (for smooth transition) 
* Use `srcset` / responsive images 
* Avoid unnecessary re-renders (memoization) 

---

## 9. UX Considerations

* Smooth transitions (CSS animations) 
* Loading placeholders for slow images 
* Fallback UI for failed image loads 
* Swipe gestures for mobile 
* Disable navigation if only one image 

---

## 10. Accessibility

* Use semantic `<button>` elements 
* Keyboard support: 
  * Arrow keys (← →) for navigation 
* `aria-label` for controls 
* Announce slide changes (e.g., "Slide 2 of 5") 
* Pause autoplay on focus to avoid disorientation 

---

## 11. Edge Cases

* Empty image list → render fallback 
* Single image → disable navigation 
* Slow network → loading indicator 
* Image load failure → fallback image 

---

## 12. Summary

* Single source of truth (`currentIndex`) 
* Handle both user-driven and automated transitions 
* Optimize image loading and rendering 
* Ensure accessibility and smooth UX 
