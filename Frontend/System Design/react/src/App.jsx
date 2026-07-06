import ImageCarousel from './components/ImageCarousel/ImageCarousel';

export default function App() {
  const sampleImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=600&h=400&fit=crop",
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
        Image Carousel - React
      </h1>
      <ImageCarousel images={sampleImages} autoplayInterval={3000} />
    </div>
  );
}
