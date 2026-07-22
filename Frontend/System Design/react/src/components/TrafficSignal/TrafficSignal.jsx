import { useEffect, useState } from "react";
import "./TrafficSignal.css";

export const LIGHTS = {
  red: { duration: 4000, next: "yellow", id: 1 },
  yellow: { duration: 500, next: "green", id: 2 },
  green: { duration: 3000, next: "red", id: 3 },
};

function TrafficSignal({ inititalValue = "green" }) {
  const [currentLight, setCurrentLight] = useState(inititalValue);

  useEffect(() => {
    const { next, duration } = LIGHTS[currentLight];

    const timeoutId = setTimeout(() => {
      setCurrentLight(next);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [currentLight]);

  return (
    <div className="traffic-signal">
      <div className="questions">
        <h4 className="title">Questions</h4>
        <ul className="question-list">
          <li className="question-list-item">
            Which light should be displayed initially? - Green
          </li>
          <li className="question-list-item">
            Should lights begin looping as soon as the component mounts? Or,
            should it be controlled by a user-interactive button? - No, user
            interaction
          </li>
          <li className="question-list-item">
            Shall I extend this component for more than 3 lights with custom
            display durations? - Yes
          </li>
        </ul>
      </div>

      <div className="lights-container">
        {Object.entries(LIGHTS).map(([key, value]) => {
          return (
            <p
              key={value.id}
              className="light"
              style={{
                backgroundColor: `${key === currentLight ? `${key.toLowerCase()}` : "transparent"}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TrafficSignal;
