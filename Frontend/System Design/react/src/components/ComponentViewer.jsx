import React from "react";
import ImageCarousel from "./ImageCarousel/ImageCarousel";
import AutocompleteSearch from "./autocomplete-search/AutocompleteSearch";
import OtpInput from "./OtpInput/OtpInput";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=800&h=500&fit=crop",
];

export default function ComponentViewer({ activeComponent }) {
  const getComponentInfo = () => {
    switch (activeComponent) {
      case "carousel":
        return {
          title: "Image Carousel",
          difficulty: "Easy - Medium",
          status: "Interactive Demo",
          requirements: [
            "Render a list of images sequentially",
            "Autoplay with configurable interval speed",
            "Left and right navigation buttons",
            "Indicator dots for quick navigation",
            "Smooth transition opacity animations"
          ]
        };
      case "autocomplete":
        return {
          title: "Autocomplete Search",
          difficulty: "Medium - Hard",
          status: "Interactive Demo",
          requirements: [
            "Perform client-side query matching against dataset",
            "Debounced filtering and search suggestions list",
            "Highlight matching characters in search results",
            "Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)",
            "Outside click detection to dismiss dropdown results",
            "Cache search query results locally to minimize API requests"
          ]
        };
      case "otpInput":
        return {
          title: "OTP Input",
          difficulty: "Medium - Hard",
          status: "Interactive Demo",
          requirements: [
            "Render a list of OTP input fields",
            "Input validation",
            "Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)",
          ]
        };
      default:
        return null;
    }
  };

  const info = getComponentInfo();
  if (!info) return null;

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <div className="viewer-title-row">
          <h1 className="viewer-title">{info.title}</h1>
          <div className="badge-row">
            <span className="badge badge-difficulty">{info.difficulty}</span>
            <span className="badge badge-status">{info.status}</span>
          </div>
        </div>
        <p className="viewer-subtitle">
          See the live demo below. You can interact with the component to test its behavior and states.
        </p>
      </div>

      <div className="viewer-layout">
        {/* Component Sandbox Canvas */}
        <div className="viewer-canvas">
          <div className="canvas-body">
            {activeComponent === "carousel" && (
              <ImageCarousel images={SAMPLE_IMAGES} autoplayInterval={4000} />
            )}
            {activeComponent === "autocomplete" && (
              <AutocompleteSearch />
            )}
            {activeComponent === "otpInput" && (
              <OtpInput />
            )}
          </div>
        </div>

        {/* Component Requirements & Details */}
        <div className="viewer-details-card">
          <h3>Key Features & Requirements</h3>
          <ul className="requirements-list">
            {info.requirements.map((req, idx) => (
              <li key={idx}>
                <span className="req-text">- {req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
