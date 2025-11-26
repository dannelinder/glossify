import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useFlashcards from '../hooks/useFlashcards';
import Flashcard from '../components/Flashcard';
import ProgressBar from '../components/ProgressBar';
import weeklyWords from '../data/weeklyWords';
import allWords from '../data/allWords';

import { useAuth } from '../context/AuthContext';
import verbs from '../data/verbs';
import { getPepp } from '../utils/getPepp';
import StreakMessage from '../components/StreakMessage';
import { loadWordListFromDB } from '../utils/wordListHelpers';


// Utility: normalize answer
function normalizeAnswer(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,;:!?]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/\u00e4/g, 'ae') // ä
    .replace(/\u00f6/g, 'oe') // ö
    .replace(/\u00fc/g, 'ue'); // ü
}

// Utility: play melody-based sound effects
function playSound(name, soundEnabled = true) {
  if (!soundEnabled) return;
  // Map logical sound names to actual file names
  const soundMap = {
    success: 'correct',
    error: 'wrong',
    pepp: 'streak',
    click: 'back',
    newword: 'newword'
  };
  const file = soundMap[name] || name;
  const audio = new window.Audio(`/sounds/${file}.wav`);
  audio.currentTime = 0;
  audio.onerror = function(e) {
    console.warn(`Sound file not found or not supported: /sounds/${file}.wav`, e);
  };
  audio.play().catch((err) => {
    // Prevent uncaught promise error
    console.warn('Audio play failed:', err);
  });
}

function PracticePage() {
  const navigate = useNavigate();
  const { list } = useParams();
  const { user, signOut } = useAuth();
  const [activeList, setActiveList] = useState(list || 'weekly');
  const [hasStarted, setHasStarted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [peppMessage, setPeppMessage] = useState('');
  const [pendingNext, setPendingNext] = useState(false);
  const [listLoaded, setListLoaded] = useState(false);
  // Remove local state for queue, current, score, totalAnswered, streak, wrongPairs
  const direction = 'sv-target'; // or get from settings

  // Use the hook with the current word array

  function getWordArrayAsync(listName) {
    // Try to load from DB, fallback to static
    let key = 'weeklyWords';
    if (listName === 'all') key = 'allWords';
    if (listName === 'verbs') key = 'verbs';
    return loadWordListFromDB(key).then((words) => {
      if (!words || words.length === 0) {
        if (listName === 'all') return allWords;
        if (listName === 'verbs') return verbs;
        return weeklyWords;
      }
      return words;
    });
  }

  const {
    queue,
    current,
    score,
    totalAnswered,
    streak,
    wrongPairs,
    loadWords,
    answerCurrent,
    goToNextWord,
    resetToWrong
  } = useFlashcards([]);


  // Stateless retry: use wrongPairs directly for retry button and logic
  function handleRetryWrong() {
    if (wrongPairs && wrongPairs.length > 0) {
      // Custom retry: start a new round with current wrongPairs
      resetToWrong(wrongPairs);
      setHasStarted(true);
      setListLoaded(true);
      setFeedback('');
      setPeppMessage('');
    }
  }


  // Debug: log wrongPairs at end of session
  useEffect(() => {
    if (current === null && !hasStarted && listLoaded) {

    }
  }, [current, hasStarted, listLoaded, wrongPairs]);

  // Whenever activeList changes, load the new words from DB or fallback
  useEffect(() => {
    getWordArrayAsync(activeList).then((words) => {

      loadWords(words);
      setListLoaded(true);
    });
    // eslint-disable-next-line
  }, [activeList]);



  function handleSubmit(answer) {
    answerCurrent(
      answer,
      normalizeAnswer,
      (isCorrect, card, newStreak) => {
        if (isCorrect) {
          const pepp = getPepp(newStreak);
          if (pepp) {
            setPeppMessage(pepp);
            playSound('pepp');
          } else {
            setPeppMessage('');
            playSound('success');
          }
          setFeedback('✓ Rätt!');
        } else {
          playSound('error');
          setPeppMessage('');
          const correctAnswer = direction === 'sv-target' ? card.ty : card.sv;
          setFeedback(`✗ Fel, rätta svaret var "${correctAnswer}"`);
        }
        setPendingNext(true);
      },
      undefined,
      direction
    );
  }


  // Clear feedback and pepp after a delay, then advance
  useEffect(() => {
    if (pendingNext) {
      const timer = setTimeout(() => {
        setFeedback('');
        setPeppMessage('');
        goToNextWord();
        setPendingNext(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [pendingNext, goToNextWord]);

  // When current becomes null (end of session), show end-of-list options
  useEffect(() => {
    if (hasStarted && current === null) {
      setHasStarted(false);
      // Do NOT set setListLoaded(false) here; keep it true so end-of-session UI is always shown
      setFeedback('');
      setPeppMessage('');
    }
  }, [current, hasStarted]);

  // Helper to check if answer is correct (for delay logic)

  // Map route param to user-friendly label
  const listLabelMap = {
    weekly: 'Veckans glosor',
    all: 'Alla glosor',
    verbs: 'Verb'
  };
  let activeLabel;
  if (listLabelMap[activeList]) {
    activeLabel = listLabelMap[activeList];
  } else if (activeList) {
    activeLabel = `Okänd lista: ${activeList}`;
  } else {
    activeLabel = 'Veckans glosor';
  }

  return (
    <div style={{
      maxWidth: 700,
      margin: '0 auto',
      padding: 24,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: '#112D54'
    }}>
      {/* Show which list is active */}
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        <h1 className="glossify-header" style={{ marginBottom: 8 }}>{activeLabel}</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {current === null && listLoaded ? (
          <div className="card" style={{ textAlign: 'center', color: '#00d4ff' }}>
            <h2 style={{ fontSize: '2.8rem', marginBottom: 24 }}>Övningen klar!</h2>
            <p style={{ fontSize: '1.4rem', marginBottom: 36, color: '#0099cc' }}>
              Du fick {score} av {totalAnswered} rätt!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <button
                onClick={() => {
                  getWordArrayAsync(activeList).then((words) => {
                    loadWords(words);
                    setHasStarted(true);
                    setListLoaded(true);
                    setFeedback('');
                    setPeppMessage('');
                  });
                }}
                style={{ width: '100%', fontSize: '1.3rem', padding: '18px 40px', borderRadius: '30px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', border: '2px solid rgba(0, 212, 255, 0.3)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
              >
                Börja om
              </button>
              {wrongPairs && wrongPairs.length > 0 && (
                <button
                  onClick={handleRetryWrong}
                  style={{ width: '100%', fontSize: '1.3rem', padding: '18px 40px', borderRadius: '30px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', border: '2px solid rgba(0, 212, 255, 0.3)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
                >
                  Öva fel svar ({wrongPairs.length})
                </button>
              )}
              <button onClick={() => { playSound('click'); navigate('/main'); }} style={{ width: '100%', fontSize: '1.3rem', padding: '18px 40px', borderRadius: '30px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', border: '2px solid rgba(0, 212, 255, 0.3)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Avsluta övning</button>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 600 }}>
            {/* Main session content: Flashcard always at top */}
            <Flashcard current={current} onSubmit={handleSubmit} normalize={normalizeAnswer} direction={direction} />
            {(!peppMessage && feedback) && (
              <div className={feedback.startsWith('✓') ? 'feedback-success' : 'feedback-error'} style={{ marginTop: 20, textAlign: 'center' }}>{feedback}</div>
            )}
            {peppMessage && <StreakMessage streak={null} message={peppMessage} />}
            {/* Progress bar below flashcard */}
            <div style={{ marginTop: 32 }}>
              <ProgressBar value={totalAnswered} max={queue.length} />
            </div>
            {/* Stats below progress bar */}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-around', background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '2px solid rgba(0, 212, 255, 0.2)' }}>
              <div>
                <div style={{ fontSize: '1rem', opacity: 0.8, color: '#00d4ff' }}>Poäng</div>
                <div style={{ fontSize: '1.7rem', fontWeight: '700' }}>{score}/{totalAnswered}</div>
              </div>
              <div>
                <div style={{ fontSize: '1rem', opacity: 0.8, color: '#00d4ff' }}>Streak</div>
                <div style={{ fontSize: '1.7rem', fontWeight: '700' }}>{streak > 0 ? `🔥 ${streak}` : streak}</div>
              </div>
              <div>
                <div style={{ fontSize: '1rem', opacity: 0.8, color: '#00d4ff' }}>Fel</div>
                <div style={{ fontSize: '1.7rem', fontWeight: '700', color: wrongPairs.length > 0 ? '#ff6b6b' : 'inherit' }}>{wrongPairs.length}</div>
              </div>
            </div>
            {/* Avsluta övning always at bottom */}
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <button onClick={() => { playSound('click'); navigate('/main'); }} className="modern-button main-action-button" style={{ maxWidth: 340 }}>
                Avsluta övning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PracticePage;