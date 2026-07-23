import { useEffect, useState } from "react";
import "./MemoryGame.css";
import { generateDeck } from "./utils";

function Card({ isFlipped, value, onCardClick, isMatched }) {
  isFlipped;
  const isRevealed = isFlipped || isMatched;
  console.log(
    "flipped: ",
    isFlipped,
    "matched: ",
    isMatched,
    "revealed: ",
    isRevealed,
  );

  return (
    <div className="card" onClick={onCardClick}>
      {!isRevealed && <p className="card-front">?</p>}
      {isRevealed && <p className="card-back">{value}</p>}
    </div>
  );
}

function MemoryGame() {
  const [cards, setCards] = useState(() => generateDeck());
  const [selectedCards, setSelectedCards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moves, setMoves] = useState(0);

  // Game Engine
  useEffect(() => {
    if (selectedCards.length !== 2) return;

    // Timeout id
    let timeoutId = null;

    // Start processing
    setIsProcessing(true);

    // Identify matched cards
    const [firstCardIndex, secondCardIndex] = selectedCards;
    if (cards[firstCardIndex].value === cards[secondCardIndex].value) {
      // Match found so set isMatched in cards
      setCards((prev) =>
        prev.map((item, index) =>
          firstCardIndex === index || secondCardIndex === index
            ? { ...item, isMatched: true }
            : item,
        ),
      );

      // Reset the turn
      resetTurn();
    } else {
      // Match not found
      // Start timer to hide the card
      timeoutId = setTimeout(() => {
        setCards((prev) =>
          prev.map((item, index) =>
            index === firstCardIndex || index === secondCardIndex
              ? { ...item, isFlipped: false }
              : item,
          ),
        );

        // Reset the turn
        resetTurn();
      }, 1000);

      // Track the moves
      setMoves((prev) => prev + 1);
    }

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [selectedCards]);

  const resetTurn = () => {
    setSelectedCards([]);
    setIsProcessing(false);
  };

  console.log("Selected cards: ", selectedCards);

  const handleCardClick = (index) => {
    // Card click action - return when the engine is processing, if the card already flipped or if  it has been matched

    if (isProcessing || cards[index].isFlipped || cards[index].isMatched)
      return;

    // Update the card
    setCards((prev) =>
      prev.map((item, idx) =>
        index === idx ? { ...item, isFlipped: true } : item,
      ),
    );
    setSelectedCards((prev) => [...prev, index]);
  };

  const handleReset = () => {
    setCards(generateDeck());
    setIsProcessing(false);
    setSelectedCards([]);
    setMoves(0);
  };

  // Game Over
  const isGameOver = cards.every((item) => item.isMatched === true);

  return (
    <div className="mg">
      <div className="mg__top">
        <p className="display-item">Moves: {moves}</p>
        {isGameOver && (
          <button type="button" onClick={handleReset}>
            Play Again
          </button>
        )}
      </div>

      {/* Display the grid */}
      <div className="mg__grid">
        {cards.map((item, index) => {
          return (
            <Card
              key={item.id}
              value={item.value}
              isFlipped={item.isFlipped}
              onCardClick={() => handleCardClick(index)}
              isMatched={item.isMatched}
            />
          );
        })}
      </div>

      {isGameOver && <p className="message"> You Won</p>}
    </div>
  );
}

export default MemoryGame;

// App.jsx
// import React, { useState, useEffect } from 'react';
// import { generateDeck } from './utils';
// import Card from './Card';
// import './App.css';

// export default function App() {
//   const [cards, setCards] = useState(() => generateDeck());
//   const [selectedCards, setSelectedCards] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [moves, setMoves] = useState(0);

//   // Check for matches when two cards are selected
//   useEffect(() => {
//     if (selectedCards.length !== 2) return;

//     setIsProcessing(true);
//     const [first, second] = selectedCards;

//     if (cards[first].value === cards[second].value) {
//       // Match found
//       setCards(prev => prev.map((card, idx) =>
//         idx === first || idx === second ? { ...card, isMatched: true } : card
//       ));
//       resetTurn();
//     } else {
//       // No match - flip back after a brief delay
//       setTimeout(() => {
//         setCards(prev => prev.map((card, idx) =>
//           idx === first || idx === second ? { ...card, isFlipped: false } : card
//         ));
//         resetTurn();
//       }, 1000);
//     }
//     setMoves(prev => prev.add + 1); // Track total turns taken
//   }, [selectedCards]);

//   const resetTurn = () => {
//     setSelectedCards([]);
//     setIsProcessing(false);
//   };

//   const handleCardClick = (index) => {
//     // Edge case preventions:
//     // 1. System is busy waiting for a mismatch timeout
//     // 2. Card is already matched
//     // 3. Card is already flipped / selected twice
//     if (isProcessing || cards[index].isMatched || cards[index].isFlipped) return;

//     // Flip the clicked card visually
//     setCards(prev => prev.map((card, idx) => idx === index ? { ...card, isFlipped: true } : card));
//     setSelectedCards(prev => [...prev, index]);
//   };

//   const handleRestart = () => {
//     setCards(generateDeck());
//     setSelectedCards([]);
//     setIsProcessing(false);
//     setMoves(0);
//   };

//   const isGameOver = cards.every(card => card.isMatched);

//   return (
//     <div className="game-container">
//       <h1>Memory Matrix</h1>
//       <p>Moves: {moves}</p>
//       {isGameOver && <button onClick={handleRestart} className="btn-restart">Play Again 🎉</button>}

//       <div className="grid">
//         {cards.map((card, index) => (
//           <Card
//             key={card.id}
//             card={card}
//             onClick={() => handleCardClick(index)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
