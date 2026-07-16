import { useState } from "react";
import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import ComponentViewer from "./components/ComponentViewer";
import "./App.css";

export default function App() {
  const [activeComponent, setActiveComponent] = useState("welcome");

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      Hello
      <Sidebar
        activeComponent={activeComponent}
        onSelectComponent={setActiveComponent}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {activeComponent === "welcome" ? (
          <WelcomeScreen onSelectComponent={setActiveComponent} />
        ) : (
          <ComponentViewer activeComponent={activeComponent} />
        )}
      </main>
    </div>
  );
}
