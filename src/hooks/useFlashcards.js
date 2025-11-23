import { useState, useCallback } from 'react'

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function useFlashcards(initialDeck = [], delayMs = 500) {
  const [deck, setDeck] = useState(initialDeck)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [current, setCurrent] = useState(null)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [score, setScore] = useState(0)
  const [wrongPairs, setWrongPairs] = useState([])
  const [streak, setStreak] = useState(0)

  const loadWords = useCallback((words) => {
const copy = [...words]
setDeck(copy)
const shuffled = shuffle(copy)
setQueue(shuffled)
setIndex(0)
setCurrent(shuffled[0] || null)
setTotalAnswered(0)
setScore(0)
setWrongPairs([])
setStreak(0)
}, [])


const resetToWrong = useCallback(() => {
// wrongPairs contains tuples [shown, correct]
if (!wrongPairs.length) return false
const list = wrongPairs.map(([a, b]) => ({ sv: a, ty: b }))
const shuffled = shuffle(list)
setQueue(shuffled)
setIndex(0)
setCurrent(shuffled[0] || null)
setTotalAnswered(0)
setScore(0)
setWrongPairs([])
setStreak(0)
return true
}, [wrongPairs])


const answerCurrent = useCallback((userAnswer, normalizeFn, onResult, customDelay, direction = 'sv-target') => {
if (!current) return
// Determine which property to check based on direction
const correctAnswer = direction === 'sv-target' ? current.ty : current.sv
const correct = normalizeFn(userAnswer) === normalizeFn(correctAnswer)
setTotalAnswered((t) => t + 1)
if (correct) {
setScore((s) => s + 1)
setStreak((st) => st + 1)
onResult(true, current)
} else {
setWrongPairs((w) => [...w, [current.sv, current.ty]])
setStreak(0)
onResult(false, current)
}


// move to next after delay
// For correct answers, use customDelay if provided, otherwise use delayMs
// For wrong answers, always use delayMs (1200)
const delay = correct && customDelay !== undefined ? customDelay : delayMs
setTimeout(() => {
setIndex((i) => {
const nextIndex = i + 1
if (nextIndex >= queue.length) {
setCurrent(null)
return nextIndex
}
setCurrent(queue[nextIndex])
return nextIndex
})
}, delay)
}, [current, queue, delayMs])


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
streak,
loadWords,
answerCurrent,
resetToWrong
}
}