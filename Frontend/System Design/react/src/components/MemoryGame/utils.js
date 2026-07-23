// NOTE: Ensure that the length of CARD_DESIGNS is always even
export const CARD_DESIGNS = ["A", "B", "C", "D"];

export const generateDeck = () => {
  // Duplicate items to make pairs and assign unique id
  const deck = [...CARD_DESIGNS, ...CARD_DESIGNS].map((item, index) => ({
    id: index,
    value: item,
    isFlipped: false,
    isMatched: false,
  }));

  // Randomize using Fisher-Yates algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};
