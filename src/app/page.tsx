"use client"

import { useEffect, useState } from "react";

const listOfWords =[
  "EXAMPLE",
  "SAMPLEE",
  "DEMOO",
  "TESTIING",
  "WORDLEE",
  "PUZZLE",
  "GAMING"
]

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const getRandomNumber = (max: number) => {
  return Math.floor(Math.random() * max);
}

export default function Home() {
  const [chosenWord, setChosenWord] = useState<string>(listOfWords[getRandomNumber(listOfWords.length)]);
  const [guessedLetters, setGuessedLetters] = useState<Array<string>>(new Array(chosenWord.length).fill(""));
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [tries, setTries] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

  const saveStateToLocalStorage = (gameState: {
    chosenWord: string;
    guessedLetters: Array<string>;
    usedLetters: Array<string>;
    tries: number;
    isGameOver: boolean;
    hasWon: boolean;
  }) => {
    localStorage.setItem("hangmanGameState", JSON.stringify(gameState));
  }

  const resetGame = () => {
    const newWord = listOfWords[getRandomNumber(listOfWords.length)];
    setChosenWord(newWord);
    setGuessedLetters(new Array(newWord.length).fill(""));
    setUsedLetters(new Set());
    setTries(3);
    setIsGameOver(false);
    setHasWon(false);
    saveStateToLocalStorage({
      chosenWord: newWord,
      guessedLetters: new Array(newWord.length).fill(""),
      usedLetters: [],
      tries: 3,
      isGameOver: false,
      hasWon: false
    });
  }

  const pressKey = (key: string) => {
    if (usedLetters.has(key)) return;

    if (/^[A-Z]$/.test(key)) {

      if (!chosenWord.includes(key)) { 
        if (tries == 1) setIsGameOver(true)
        setTries((prevTries) => prevTries - 1);
      }

      setGuessedLetters((prevLetters) => {
        const newLetters = [...prevLetters];
        for (let i = 0; i < chosenWord.length; i++) {
          // Fill all occurrences of the letter
          if (chosenWord[i] === key) {
            newLetters[i] = key;
          }
        }
        if (!newLetters.includes("")) {
          setIsGameOver(true);
          setHasWon(true);
        }
        return newLetters;
      });

      if(!usedLetters.has(key)) {
        setUsedLetters((prevUsed) => new Set(prevUsed).add(key));
      }
    }
  }

  useEffect(() => {
    if (isGameOver) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      pressKey(key);
      
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [tries, chosenWord, usedLetters, isGameOver, guessedLetters]);

  useEffect(() => {
    const getStateFromLocalStorage = () => {
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

    getStateFromLocalStorage();
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
  
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="mb-30">
        <p>{chosenWord}</p>
        <p>vidas: {tries}</p>
      </div>
      {isGameOver
        ? <div className="text-center">
            {hasWon ? <p> Ganaste!</p> : <p> Perdiste!</p>}
            <button
              type="button"
              className="mt-4 rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
              onClick={resetGame}
            >
              Empezar nuevamente
            </button>
        </div>
        : <>
            <div className="flex items-end gap-4">
              {guessedLetters.map((letter, index) => (
                <span
                  key={index}
                  className="animate-wave inline-block text-6xl font-bold text-zinc-900 dark:text-zinc-100"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {letter || "_"}
                </span>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-7 gap-2">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  className={`inline-block rounded px-2 py-1 text-zinc-900 dark:text-zinc-100 ${
                    usedLetters.has(letter)
                      ? "bg-zinc-400 dark:bg-zinc-700"
                      : "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
                  }`}
                  disabled={usedLetters.has(letter)}
                  onClick={() => pressKey(letter)}
                >
                  {letter}
                </button>
              ))}

            </div>
          </>
      }

      <div className="mt-30">
        <p>Letras usadas:</p>
        <div className="flex gap-2 mt-2">
          {[...usedLetters].map((letter, index) => (
            <span
              key={index}
              className="inline-block rounded bg-zinc-200 px-2 py-1 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {letter}
            </span>
          ))}
          </div>

      </div>
    </div>
  );
}
