import React from "react";

export default function WelcomeScreen({ onSelectComponent }) {
  const cards = [
    {
      key: "carousel",
      title: "Image Carousel",
      desc: "An interactive, responsive image slider featuring automatic rotation, custom interval controls, transitions, and dot indicators.",
      color: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
    },
    {
      key: "autocomplete",
      title: "Autocomplete Search",
      desc: "A search-as-you-type autocomplete input component featuring matched text highlighting, dropdown suggestions, and keyboard arrow key navigation.",
      color: "linear-gradient(135deg, #4E4376 0%, #2B5876 100%)",
    },
    {
      key: "otpInput",
      title: "OTP Input",
      desc: "OTP Input with auto-focus and allows only numeric values",
      color: "linear-gradient(135deg, #4E4376 0%, #2B5876 100%)",
    },
    {
      key: "trafficSignal",
      title: "Traffic Signal",
      desc: "A traffic signal component displaying red, yellow and green lights",
      color: "linear-gradient(135deg, #4E4376 0%, #2B5876 100%)",
    },
    {
      key: "memoryGame",
      title: "Memory Game",
      desc: "A memory game that asks users to select all matching pairs",
      color: "linear-gradient(135deg, #4E4376 0%, #2B5876 100%)",
    },
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1 className="welcome-title">System Design Sandbox</h1>
        <p className="welcome-subtitle">
          Welcome to the React Machine Coding practice sandbox. Select a
          component from the sidebar or click one of the modules below to start
          exploring the implementation.
        </p>
      </div>

      <div className="welcome-grid">
        {cards.map((card) => (
          <div
            key={card.key}
            className="welcome-card"
            style={{ "--hover-color": card.color }}
          >
            <h3 className="card-title">{card.title}</h3>
            <p className="card-desc">{card.desc}</p>
            <button
              type="button"
              onClick={() => onSelectComponent(card.key)}
              className="card-action-btn"
            >
              Launch Demo &rarr;
            </button>
          </div>
        ))}
      </div>

      <div className="welcome-footer">
        <p>
          Interactive playground designed to master UI components and machine
          coding interviews.
        </p>
      </div>
    </div>
  );
}
