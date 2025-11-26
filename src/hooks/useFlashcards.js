
import React, { useState, useCallback } from 'react';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function useFlashcards(initialDeck = [], delayMs = 500) {
  const [deck, setDeck] = useState(initialDeck);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongPairs, setWrongPairs] = useState([]);
  const [remainingWrongs, setRemainingWrongs] = useState([]);
  const [lastMistakes, setLastMistakes] = useState([]);
  const [streak, setStreak] = useState(0);

  // When session ends (current becomes null), update remainingWrongs with new mistakes
    React.useEffect(() => {
      if (current === null) {
        setLastMistakes(wrongPairs);
        if (wrongPairs.length > 0) {
          setRemainingWrongs(wrongPairs);
        } else {
          setRemainingWrongs([]);
        }
      }
    }, [current, wrongPairs]);

  const loadWords = useCallback((words) => {
    const copy = [...words];
    setDeck(copy);
    const shuffled = shuffle(copy);
    setQueue(shuffled);
    setIndex(0);
    setCurrent(shuffled[0] || null);
    setTotalAnswered(0);
    setScore(0);
    setWrongPairs([]);
    setRemainingWrongs([]);
    setStreak(0);
  }, []);




  // Accepts a list of pairs to retry, for stateless retry logic
  function resetToWrong(wrongList) {
    if (!wrongList || wrongList.length === 0) return;
    // Convert [sv, ty] pairs back to {sv, ty} objects
    const retryQueue = wrongList.map(([sv, ty]) => ({ sv, ty }));
    setQueue(retryQueue);
    setCurrent(retryQueue[0] || null);
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    // Clear wrongPairs BEFORE retry round starts
    setWrongPairs([]);
  }



const answerCurrent = useCallback((userAnswer, normalizeFn, onResult, customDelay, direction = 'sv-target') => {
  if (!current) return;
  // Determine which property to check based on direction
  const correctAnswer = direction === 'sv-target' ? current.ty : current.sv;
  const correct = normalizeFn(userAnswer) === normalizeFn(correctAnswer);
  setTotalAnswered((t) => t + 1);
  if (correct) {
    setScore((s) => s + 1);
    setStreak((st) => {
      const newStreak = st + 1;
      onResult(true, current, newStreak);
      return newStreak;
    });
  } else {
    setWrongPairs((w) => [...w, [current.sv, current.ty]]);
    // Always reset streak to 0 on wrong answer, never increment
    setStreak((st) => {
      onResult(false, current, 0);
      return 0;
    });
  }
  // Do not advance to next word here; UI will call goToNextWord
}, [current, queue])

const goToNextWord = useCallback(() => {
  setIndex((i) => {
    const nextIndex = i + 1;
    if (nextIndex >= queue.length) {
      setCurrent(null);
      return nextIndex;
    }
    setCurrent(queue[nextIndex]);
    return nextIndex;
  });
}, [queue]);


const hasMore = current !== null


  return {
    deck,
    queue,
    current,
    index,
    hasMore,
    totalAnswered,
    score,
    wrongPairs,
    remainingWrongs,
    lastMistakes,
    streak,
    loadWords,
    answerCurrent,
    goToNextWord,
    resetToWrong
  };
}