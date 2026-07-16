import React from "react";

export default function Sidebar({ activeComponent, onSelectComponent }) {
  const menuItems = [
    { key: "welcome", label: "Dashboard Home" },
    { key: "carousel", label: "Image Carousel" },
    { key: "autocomplete", label: "Autocomplete Search" }
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand" onClick={() => onSelectComponent("welcome")}>
        <div className="brand-text">
          <h2>React Sandbox</h2>
          <span>Machine Coding</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const isActive = activeComponent === item.key;
            return (
              <li key={item.key} className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${isActive ? "active" : ""}`}
                  onClick={() => onSelectComponent(item.key)}
                >
                  <span className="nav-label">{item.label}</span>
                  {isActive && <span className="active-indicator" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
