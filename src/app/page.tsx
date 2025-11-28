"use client"

import { useEffect, useState } from "react";

// Constants
const listOfWords = [
  "EXAMPLE",
  "SAMPLEE",
  "DEMOO",
  "TESTIING",
  "WORDLEE",
  "PUZZLE",
  "GAMING"
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const INITIAL_TRIES = 3;

// Utility Functions
const getRandomNumber = (max: number): number => {
  return Math.floor(Math.random() * max);
};

const getRandomWord = (): string => {
  return listOfWords[getRandomNumber(listOfWords.length)];
};

// Main Component
export default function Home() {
  // State Management
  const [chosenWord, setChosenWord] = useState<string>(getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState<Array<string>>(
    new Array(chosenWord.length).fill("")
  );
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [tries, setTries] = useState<number>(INITIAL_TRIES);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

  // Local Storage Functions
  const saveStateToLocalStorage = (gameState: {
    chosenWord: string;
    guessedLetters: Array<string>;
    usedLetters: Array<string>;
    tries: number;
    isGameOver: boolean;
    hasWon: boolean;
  }) => {
    localStorage.setItem("hangmanGameState", JSON.stringify(gameState));
  };



  // Game Logic Functions
  const resetGame = () => {
    const newWord = getRandomWord();
    const initialGuessedLetters = new Array(newWord.length).fill("");
    
    setChosenWord(newWord);
    setGuessedLetters(initialGuessedLetters);
    setUsedLetters(new Set());
    setTries(INITIAL_TRIES);
    setIsGameOver(false);
    setHasWon(false);
    
    saveStateToLocalStorage({
      chosenWord: newWord,
      guessedLetters: initialGuessedLetters,
      usedLetters: [],
      tries: INITIAL_TRIES,
      isGameOver: false,
      hasWon: false
    });
  };

  const pressKey = (key: string) => {
    // Prevent duplicate guesses
    if (usedLetters.has(key)) return;
    
    // Validate input is a single letter
    if (!/^[A-Z]$/.test(key)) return;

    // Check if letter is in the word
    const isCorrectGuess = chosenWord.includes(key);
    
    // Handle incorrect guess
    if (!isCorrectGuess) {
      const newTries = tries - 1;
      setTries(newTries);
      
      if (newTries === 0) {
        setIsGameOver(true);
      }
    }

    // Update guessed letters
    setGuessedLetters((prevLetters) => {
      const newLetters = [...prevLetters];
      
      for (let i = 0; i < chosenWord.length; i++) {
        if (chosenWord[i] === key) {
          newLetters[i] = key;
        }
      }
      
      // Check if player has won
      if (!newLetters.includes("")) {
        setIsGameOver(true);
        setHasWon(true);
      }
      
      return newLetters;
    });

    // Mark letter as used
    setUsedLetters((prevUsed) => new Set(prevUsed).add(key));
  };

  // Effects
  useEffect(() => {
    const getItemsFromLocalStorage = () => {
      const savedState = localStorage.getItem("hangmanGameState");
      if (savedState) {
        const {
          chosenWord,
          guessedLetters,
          usedLetters,
          tries,
          isGameOver,
          hasWon
        } = JSON.parse(savedState);
        
        setChosenWord(chosenWord);
        setGuessedLetters(guessedLetters);
        setUsedLetters(new Set(usedLetters));
        setTries(tries);
        setIsGameOver(isGameOver);
        setHasWon(hasWon);
      }
    }

    getItemsFromLocalStorage();
  }, []);

  useEffect(() => {
    saveStateToLocalStorage({
      chosenWord,
      guessedLetters,
      usedLetters: Array.from(usedLetters),
      tries,
      isGameOver,
      hasWon
    });
  }, [chosenWord, guessedLetters, usedLetters, tries, isGameOver, hasWon]);

  useEffect(() => {
    if (isGameOver) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      pressKey(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tries, chosenWord, usedLetters, isGameOver, guessedLetters]);

  // Render
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {/* Debug Info (hidden in production) */}
      <div className="mb-8 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Palabra: {chosenWord}
        </p>
        <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
          Vidas: {tries}
        </p>
      </div>

      {/* Game Over Screen */}
      {isGameOver ? (
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {hasWon ? "¡Ganaste! 🎉" : "¡Perdiste! 😢"}
          </h2>
          <p className="mb-6 text-xl text-zinc-600 dark:text-zinc-400">
            La palabra era: <span className="font-bold">{chosenWord}</span>
          </p>
          <button
            type="button"
            className="rounded bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
            onClick={resetGame}
          >
            Empezar nuevamente
          </button>
        </div>
      ) : (
        <>
          {/* Word Display */}
          <div className="mb-12 flex items-end gap-4">
            {guessedLetters.map((letter, index) => (
              <span
                key={index}
                className="inline-block text-6xl font-bold text-zinc-900 transition-all dark:text-zinc-100"
              >
                {letter || "_"}
              </span>
            ))}
          </div>

          {/* Keyboard */}
          <div className="mb-12 grid grid-cols-7 gap-2">
            {alphabet.map((letter) => {
              const isUsed = usedLetters.has(letter);
              
              return (
                <button
                  key={letter}
                  className={`rounded px-4 py-2 font-semibold transition-colors ${
                    isUsed
                      ? "cursor-not-allowed bg-zinc-400 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-500"
                      : "cursor-pointer bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                  disabled={isUsed}
                  onClick={() => pressKey(letter)}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Used Letters Display */}
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Letras usadas:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[...usedLetters].length > 0 ? (
                [...usedLetters].map((letter, index) => (
                  <span
                    key={index}
                    className="inline-block rounded bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {letter}
                  </span>
                ))
              ) : (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Ninguna todavía
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}