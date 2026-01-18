
import React, { useState, useCallback } from 'react';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function useFlashcards(initialDeck = [], delayMs = 500, deterministicOrder = false) {
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
  const [isRetrySession, setIsRetrySession] = useState(false);
  const [originalSessionStats, setOriginalSessionStats] = useState(null);

  // When session ends (current becomes null), update remainingWrongs with new mistakes
    React.useEffect(() => {
      if (current === null && !isRetrySession) {
        // Store original session stats before showing retry options
        setOriginalSessionStats({
          totalQuestions: queue.length,
          correctAnswers: score,
          totalAnswered: totalAnswered
        });
        setLastMistakes(wrongPairs);
        if (wrongPairs.length > 0) {
          setRemainingWrongs(wrongPairs);
        } else {
          setRemainingWrongs([]);
        }
      }
    }, [current, wrongPairs, isRetrySession, queue.length, score, totalAnswered]);

  const loadWords = useCallback((words) => {
    let arr;

    if (deterministicOrder) {
      // Use a true deep copy of the input array, preserving order (to match test)
      arr = JSON.parse(JSON.stringify(words));

    } else {
      arr = shuffle([...words]);
    }
    setDeck(arr);
    setQueue(arr);

    setIndex(0);
    setCurrent(arr[0] || null);

    setTotalAnswered(0);
    setScore(0);
    setWrongPairs([]);
    setRemainingWrongs([]);
    setStreak(0);
    setIsRetrySession(false);
    setOriginalSessionStats(null);
  }, [deterministicOrder]);

  // Accepts a list of pairs to retry, for stateless retry logic
  function resetToWrong(wrongList) {
    if (!wrongList || wrongList.length === 0) return;
    // Convert [sv, ty] pairs back to {sv, ty} objects
    const retryQueue = wrongList.map(([sv, ty]) => ({ sv, ty }));
    setQueue(retryQueue);
    setIndex(0); // Reset index to 0 for retry session
    setCurrent(retryQueue[0] || null);
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    setIsRetrySession(true);
    // Clear wrongPairs BEFORE retry round starts
    setWrongPairs([]);
    setRemainingWrongs([]);
  }

  // Clear wrongPairs after all wrongs are corrected in retry session
  React.useEffect(() => {
    if (queue.length === 0 && current === null && wrongPairs.length > 0) {
      setWrongPairs([]);
      setRemainingWrongs([]);
    }
  }, [queue.length, current, wrongPairs]);


const answerCurrent = useCallback((userAnswer, normalizeFn, onResult, customDelay, direction = 'sv-target', partialPromptInfo = null) => {
  if (!current) return;
  
  let correct;
  if (partialPromptInfo) {
    // For partial prompts, compare against the expected verb part only
    correct = normalizeFn(userAnswer) === normalizeFn(partialPromptInfo.expectedAnswer);
  } else {
    // Normal full answer comparison
    const correctAnswer = direction === 'sv-target' ? current.ty : current.sv;
    correct = normalizeFn(userAnswer) === normalizeFn(correctAnswer);
  }
  
  setTotalAnswered((t) => t + 1);
  if (correct) {
    setScore((s) => s + 1);
    setStreak((st) => {
      const newStreak = st + 1;
      onResult(true, current, newStreak);
      return newStreak;
    });
  } else {
    // Always store the original full answer pairs, not partial answers
    setWrongPairs((w) => [...w, [current.sv, current.ty]]);
    // Always reset streak to 0 on wrong answer, never increment
    setStreak((st) => {
      onResult(false, current, 0);
      return 0;
    });
  }
  // Do not advance to next word here; UI will call goToNextWord
}, [current])

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
    hasMore: current !== null,
    totalAnswered,
    score,
    wrongPairs,
    remainingWrongs,
    lastMistakes,
    streak,
    isRetrySession,
    originalSessionStats,
    loadWords,
    answerCurrent,
    goToNextWord,
    resetToWrong
  };
}