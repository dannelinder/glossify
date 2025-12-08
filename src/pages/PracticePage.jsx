import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
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
import { motion } from 'framer-motion';

// Utility: get feedback display duration (test flag aware)
function getFeedbackDisplayMs(type = 'default') {
  // You can expand this switch for more types if needed
  const isTest = process.env.NODE_ENV === 'test' || window.__TEST_MODE__;
  if (isTest) {
    // Always use a short duration in test mode for all feedback types
    return 1000;
  }
  switch (type) {
    case 'streak':
    case 'pepp':
      return 3000; // Show pepp/streak a bit shorter
    case 'error':
      return 1500;
    case 'success':
      return 1500;
    default:
      return 1500;
  }
}


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
function playSound(name, soundEnabled = true, volume = 1) {
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
  audio.volume = volume;
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
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [listLoaded, setListLoaded] = useState(false);
  // Remove local state for queue, current, score, totalAnswered, streak, wrongPairs
  const direction = 'sv-target'; // or get from settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.2);
  // Load user settings from Supabase
  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (isMounted && data) {
        setSoundEnabled(data.sound_enabled ?? true);
        setVolume(typeof data.volume === 'number' ? data.volume : 0.2);
      }
    }
    fetchSettings();
    return () => { isMounted = false; };
  }, [user]);

  // Deterministic order for tests
  const deterministicOrder = process.env.NODE_ENV === 'test' || window.__TEST_MODE__;

  // Use the hook with the current word array
  function getWordArrayAsync(listName) {
    // Try to load from DB, fallback to static
    let key = 'weeklyWords';
    if (listName === 'all') key = 'allWords';
    if (listName === 'verbs') key = 'verbs';
    return loadWordListFromDB(key).then((words) => {
      let result;
      if (!words || words.length === 0) {
        if (listName === 'all') result = allWords;
        else if (listName === 'verbs') result = verbs;
        else result = weeklyWords;
      } else {
        result = words;
      }
      // If deterministicOrder, always return the original array reference (not a copy)
      if (deterministicOrder) {
        if (listName === 'all') return allWords;
        if (listName === 'verbs') return verbs;
        return weeklyWords;
      }
      // If not deterministic, shuffle (if you have a shuffle util, use it here)
      return Array.isArray(result) ? [...result].sort(() => Math.random() - 0.5) : result;
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
  } = useFlashcards([], 500, deterministicOrder);


  // Ref to track manual restart
  const manualRestarting = useRef(false);
  // Cancellation token to prevent race conditions on queue/current word
  const initTokenRef = useRef(0);

  // Stateless retry: use wrongPairs directly for retry button and logic
  function handleRetryWrong() {
    if (wrongPairs && wrongPairs.length > 0) {
      // Sort wrongPairs according to the original word order for deterministic retry
      let originalOrder = [];
      if (activeList === 'all') originalOrder = allWords;
      else if (activeList === 'verbs') originalOrder = verbs;
      else originalOrder = weeklyWords;
      // Map to string key for comparison
      const wrongSet = new Set(wrongPairs.map(([sv, ty]) => `${sv};${ty}`));
      const sortedWrongPairs = originalOrder
        .map(({ sv, ty }) => [sv, ty])
        .filter(([sv, ty]) => wrongSet.has(`${sv};${ty}`));
      resetToWrong(sortedWrongPairs);
      setHasStarted(true);
      setListLoaded(true);
      setFeedback('');
      setPeppMessage('');
    }
  }

  useEffect(() => {
    if (current === null && !hasStarted && listLoaded) {

    }
  }, [current, hasStarted, listLoaded, wrongPairs]);

  // Whenever activeList changes, load the new words from DB or fallback
  useEffect(() => {
    // Increment the token for each effect run
    const myToken = ++initTokenRef.current;
    if (manualRestarting.current) {
      manualRestarting.current = false;
      return;
    }
    getWordArrayAsync(activeList).then((words) => {
      // Only set state if this is the latest effect
      if (initTokenRef.current !== myToken) return;
      if (Array.isArray(words)) {

      }
      loadWords(words);
      setListLoaded(true);
    });
    // No need for cancelled flag; token handles all async overlap
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
            playSound('pepp', soundEnabled, volume);
          } else {
            setPeppMessage('');
            playSound('success', soundEnabled, volume);
          }
          setFeedback('✓ Rätt!');
        } else {
          playSound('error', soundEnabled, volume);
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
      let feedbackType = 'default';
      if (peppMessage) {
        feedbackType = 'pepp';
      } else if (feedback.startsWith('✓')) {
        feedbackType = 'success';
      } else if (feedback.startsWith('✗')) {
        feedbackType = 'error';
      }
      const displayMs = getFeedbackDisplayMs(feedbackType);
      // Always use getFeedbackDisplayMs for all feedback durations
      const timer = setTimeout(() => {
        setFeedback('');
        setPeppMessage('');
        goToNextWord();
        setPendingNext(false);
      }, displayMs);
      return () => clearTimeout(timer);
    }
  }, [pendingNext, goToNextWord, feedback, peppMessage, queue.length]);

  // When current becomes null (end of session), always show end-of-list options
  useEffect(() => {
    if (current === null && listLoaded) {
      setHasStarted(false);
      setFeedback('');
      setPeppMessage('');
      setShowSessionComplete(true);
    }
  }, [current, listLoaded]);

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

  // Show session complete UI if session is over (current === null and hasStarted was true)
  const isSessionComplete = showSessionComplete && listLoaded;

  // Robust restart handler with token cancellation
  // Two-step restart: first hide session complete UI, then reset flashcard state in useLayoutEffect
  const pendingRestart = useRef(false);
  function handleRestart() {
    setShowSessionComplete(false); // Hide session complete UI immediately
    pendingRestart.current = true;
  }

  useLayoutEffect(() => {
    if (!showSessionComplete && pendingRestart.current) {
      manualRestarting.current = true;
      // Cancel any pending effect by incrementing the token
      initTokenRef.current++;
      // Use a deep copy of the correct list as-is (preserve order)
      let sourceList = weeklyWords;
      if (activeList === 'all') sourceList = allWords;
      else if (activeList === 'verbs') sourceList = verbs;
      const copy = JSON.parse(JSON.stringify(sourceList));
      if (Array.isArray(copy)) {

      }
      setHasStarted(true);
      setListLoaded(true);
      setFeedback('');
      setPeppMessage('');
      loadWords(copy);
      pendingRestart.current = false;
    }
  }, [showSessionComplete, loadWords, activeList, allWords, verbs, weeklyWords]);

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
        <motion.h1
          className="glossify-header"
          style={{ marginBottom: 8 }}
          key={activeLabel}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activeLabel}
        </motion.h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {isSessionComplete ? (
          <div className="card" style={{ textAlign: 'center', color: '#00d4ff' }}>
            <h2 id="session-complete-title" style={{ fontSize: '2.8rem', marginBottom: 24 }}>Övningen klar!</h2>
            <p style={{ fontSize: '1.4rem', marginBottom: 36, color: '#0099cc' }}>
              Du fick {score} av {totalAnswered} rätt!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <button
                id="borja-om-btn"
                onClick={handleRestart}
                style={{ width: '100%', fontSize: '1.3rem', padding: '18px 40px', borderRadius: '30px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', border: '2px solid rgba(0, 212, 255, 0.3)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
              >
                Börja om
              </button>
              {wrongPairs && wrongPairs.length > 0 && (
                <button
                  id="ova-fel-svar-btn"
                  onClick={() => {
                    handleRetryWrong();
                    setShowSessionComplete(false);
                  }}
                  style={{ width: '100%', fontSize: '1.3rem', padding: '18px 40px', borderRadius: '30px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', border: '2px solid rgba(0, 212, 255, 0.3)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
                >
                  Öva fel svar{` (${wrongPairs.length})`}
                </button>
              )}
              <button onClick={() => { playSound('click', soundEnabled, volume); navigate('/main'); }} style={{ width: '100%', fontSize: '1.3rem', padding: '18px 40px', borderRadius: '30px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', border: '2px solid rgba(0, 212, 255, 0.3)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Avsluta övning</button>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 600 }}>
            {/* Main session content: Flashcard always at top */}
            <Flashcard current={current} onSubmit={handleSubmit} normalize={normalizeAnswer} direction={direction} />
            {/* Always render feedback if present, even with pepp/streak */}
            {feedback && (
              <div
                className={feedback.startsWith('✓') ? 'feedback-success' : 'feedback-error'}
                id={feedback.startsWith('✓') ? 'feedback-success' : 'feedback-error'}
                style={{ marginTop: 20, textAlign: 'center' }}
              >
                {feedback}
              </div>
            )}
            {peppMessage && (
              <StreakMessage
                streak={null}
                message={peppMessage}
                id={peppMessage.toLowerCase().includes('streak') || peppMessage.toLowerCase().includes('rad') ? 'streak-message' : 'pepp-message'}
              />
            )}
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
              <button id="avsluta-ovning-btn" onClick={() => { playSound('click', soundEnabled, volume); navigate('/main'); }} className="modern-button main-action-button" style={{ maxWidth: 340 }}>
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