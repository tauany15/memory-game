import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import pairs from "./data/pairs";
import Cards from "./Cards";

export default function App() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [wrongCards, setWrongCards] = useState([]);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  function generateDeck() {
    const deck = [];
    setDisabled(true);
    pairs.forEach((pair) => {
      deck.push({
        uid: `${pair.id}-country`,
        pairId: pair.id,
        text: pair.country,
        matched: false,
      });
      deck.push({
        uid: `${pair.id}-capital`,
        pairId: pair.id,
        text: pair.capital,
        matched: false,
      });
    });
    return shuffleArray(deck);
  }

  useEffect(() => {
    setCards(generateDeck());
  }, []);

  function restartDeck() {
    const deck = [];
    setDisabled(false);
    pairs.forEach((pair) => {
      deck.push({
        uid: `${pair.id}-country`,
        pairId: pair.id,
        text: pair.country,
        matched: false,
      });
      deck.push({
        uid: `${pair.id}-capital`,
        pairId: pair.id,
        text: pair.capital,
        matched: false,
      });
    });
    return deck;
  }

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      setDisabled(true);
      const [first, second] = flipped;

      if (first.pairId === second.pairId) {
        setCards((prevCards) =>
          prevCards.map((c) =>
            c.pairId === first.pairId ? { ...c, matched: true } : c
          )
        );
        setFlipped([]);
        setDisabled(false);
      } else {
        setWrongCards([first.uid, second.uid]);
        setTimeout(() => {
          setDisabled(false);
          setFlipped([]);
          setWrongCards([]);
        }, 900);
      }
    }
  }, [flipped]);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval); // cleanup
  }, [isActive]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setIsActive(false); // stop timer
    }
  }, [cards]);

  function checkFlipped(card) {
    if (disabled) return;
    if (card.matched) return;
    if (flipped.some((f) => f.uid === card.uid)) return;

    setFlipped((prev) => [...prev, card]);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen bg-gradient-to-br from-purple-200 to-pink-200 p-4">
      <h1 className="text-4xl font-bold mb-6 text-purple-900 drop-shadow-lg">
        Memory Game
      </h1>
      <div className="text-lg font-semibold text-gray-800 mb-6">
        ⏱ Time: {formatTime(time)}
      </div>
      <div className="w-full max-w-5xl px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
          {cards.map((card) => (
            <Cards
              key={card.uid}
              card={card}
              isFlipped={
                flipped.some((f) => f.uid === card.uid) || card.matched
              }
              isWrong={wrongCards.includes(card.uid)}
              onClick={() => checkFlipped(card)}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 my-6">
          <button
            className="px-4 py-2 bg-red-500 text-gray rounded hover:bg-red-600 shadow-md"
            onClick={() => {
              setCards(restartDeck())
              setFlipped([]);
              setTime(0);
              setIsActive(true);
            }}
          >
            🔄 Restart
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-gray rounded hover:bg-green-600 shadow-md"
            onClick={() => {
              setCards(generateDeck());
              setFlipped([]);
              setTime(0);
              setIsActive(true);
              setDisabled(false);
            }}
          >
            ▶️ Start
          </button>
          <button
            onClick={() => setIsActive(!isActive)}
            className="px-4 py-2 bg-blue-500 text-gray rounded hover:bg-blue-600 shadow-md"
          >
            {isActive ? "Pause ⏸️" : "Resume ▶️"}
          </button>
        </div>
      </div>
    </div>
  );
}
