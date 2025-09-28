import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Cards from "./Cards";
import pairs from "./data/pairs";

/* ---------- Utils ---------- */

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m)}:${String(sec).padStart(2, "0")}`;
}

function fisherYatesShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck() {
  const deck = [];
  for (const pair of pairs) {
    deck.push({ uid: `${pair.id}-country`, pairId: pair.id, text: pair.country, matched: false });
    deck.push({ uid: `${pair.id}-capital`, pairId: pair.id, text: pair.capital, matched: false });
  }
  return fisherYatesShuffle(deck);
}

/* ---------- Component ---------- */

export default function App() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [wrongCards, setWrongCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const disabled = gameWon || flipped.length === 2;
  const restartBtnRef = useRef(null);

  useEffect(() => {
    setCards(buildDeck());
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every(c => c.matched);
    if (allMatched) {
      setIsActive(false);
      setGameWon(true);
    }
  }, [cards]);

  const handleCardClick = useCallback((card) => {
    if (disabled || card.matched) return;
    if (flipped.some(f => f.uid === card.uid)) return;
  
    // Start timer on first flip
    if (!isActive && time === 0 && moves === 0) setIsActive(true);
  
    // If this is the second card of the pair, count 1 move
    if (flipped.length === 1) {
      setMoves(m => m + 1);
    }
  
    // Build next flipped array without side-effecting inside an updater
    const next = [...flipped, card];
    setFlipped(next);
  
    if (next.length === 2) {
      const [a, b] = next;
  
      if (a.pairId === b.pairId) {
        // Match: mark matched and clear selection
        setCards(prev =>
          prev.map(c => (c.pairId === a.pairId ? { ...c, matched: true } : c))
        );
        setFlipped([]);
      } else {
        // Mismatch: show wrong state briefly, then clear both
        setWrongCards([a.uid, b.uid]);
        setTimeout(() => {
          setWrongCards([]);
          setFlipped([]);
        }, 900);
      }
    }
  }, [disabled, flipped, isActive, moves, time]);


  const restartGame = useCallback((startImmediately = true) => {
    setCards(buildDeck());
    setFlipped([]);
    setWrongCards([]);
    setMoves(0);
    setTime(0);
    setGameWon(false);
    setIsActive(startImmediately);
    if (restartBtnRef.current) restartBtnRef.current.focus();
  }, []);

  const statusText = useMemo(() => `⏱ ${formatTime(time)} • 🎯 ${moves} moves`, [time, moves]);

  return (
    <>
      <div className="flex flex-col items-center justify-start w-full min-h-screen bg-gradient-to-br from-purple-200 to-pink-200 p-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-purple-900 drop-shadow-lg">
          Memory Game
        </h1>

        <div className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6" aria-live="polite">
          {statusText}
        </div>

        <div className="w-full max-w-5xl px-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4" role="grid" aria-label="Memory board">
            {cards.map((card) => (
              <div role="gridcell" key={card.uid}>
                <Cards
                  card={card}
                  isFlipped={flipped.some(f => f.uid === card.uid) || card.matched}
                  isWrong={wrongCards.includes(card.uid)}
                  onClick={() => handleCardClick(card)}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 my-4 sm:my-6">
            <button
              ref={restartBtnRef}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 ring-offset-2 ring-offset-white"
              onClick={() => restartGame(false)}
              aria-label="Restart game"
            >
              🔄 Restart
            </button>

            <button
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 ring-offset-2 ring-offset-white"
              onClick={() => restartGame(true)}
              aria-label="Start new game"
            >
              ▶️ Start
            </button>

            <button
              onClick={() => setIsActive(a => !a)}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 ring-offset-2 ring-offset-white"
              aria-pressed={isActive}
              aria-label={isActive ? "Pause timer" : "Resume timer"}
            >
              {isActive ? "Pause ⏸️" : "Resume ▶️"}
            </button>
          </div>
        </div>
      </div>

      {/* Win modal */}
      {gameWon && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="win-title"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 id="win-title" className="text-2xl font-bold text-purple-800 mb-2">
                🎉 You won!
              </h2>
              <p className="text-gray-700 mb-4">
                You finished in <span className="font-semibold">{moves}</span> moves and{" "}
                <span className="font-semibold">{formatTime(time)}</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  autoFocus
                  onClick={() => restartGame(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-4 py-2 bg-purple-600 text-white font-medium hover:bg-purple-700 active:scale-95 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 ring-offset-2 ring-offset-white"
                >
                  ▶️ Play again
                </button>
                <button
                  onClick={() => {
                    setGameWon(false);
                    if (restartBtnRef.current) restartBtnRef.current.focus();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-4 py-2 bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 active:scale-95 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200 ring-offset-2 ring-offset-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
