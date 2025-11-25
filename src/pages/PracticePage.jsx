import React, { useState, useEffect } from 'react'
import useFlashcards from '../hooks/useFlashcards'
import Flashcard from '../components/Flashcard'
import ProgressBar from '../components/ProgressBar'
import ManagePage from './ManagePage'
import SettingsPage from './SettingsPage'
import weeklyWords from '../data/weeklyWords'
import allWords from '../data/allWords'
import verbs from '../data/verbs'
import { getPepp } from '../utils/getPepp'
import { loadWordListFromDB } from '../utils/wordListHelpers'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import StreakMessage from '../components/StreakMessage'

export default function PracticePage() {
  const { signOut, user } = useAuth()
  const {
    queue,
    current,
    totalAnswered,
    score,
    wrongPairs,
    streak,
    loadWords,
    answerCurrent,
    resetToWrong
  } = useFlashcards([], 1200)


  // Start a practice session with the given list
  function startWithList(list) {
    setHasStarted(true)
    setFeedback('') // Clear feedback when starting a new session
    loadWords(list)
  }

  // Handle answer submission from Flashcard
  function handleResult(correct, card, newStreak) {
    if (correct) {
      setFeedback('✓ Rätt!');
      const pepp = getPepp(newStreak);
      console.log('handleResult:', { correct, newStreak, pepp });
      setPeppMessage(pepp || '');
      if (pepp && soundEnabled) playSound('pepp');
      else if (soundEnabled) playSound('correct');
    } else {
      setFeedback('✗ Fel!');
      setPeppMessage('');
      if (soundEnabled) playSound('wrong');
    }
    // Clear feedback and pepp after 1.2s
    setTimeout(() => {
      setFeedback('');
      setPeppMessage('');
    }, 1200);
  }

  function handleSubmit(answer) {
    answerCurrent(
      answer,
      normalizeAnswer,
      handleResult,
      undefined,
      direction
    )
  }

// Sound effects using Web Audio API
const playSound = (type) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  if (type === 'correct') {
    // Happy ascending notes
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } else if (type === 'pepp') {
    // Epic celebration sound - ascending arpeggio with multiple tones
    const playNote = (freq, time, duration) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()
      osc.connect(gain)
      gain.connect(audioContext.destination)
      osc.frequency.setValueAtTime(freq, time)
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.35, time)
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration)
      osc.start(time)
      osc.stop(time + duration)
    }
    
    // Play victory chord progression
    const now = audioContext.currentTime
    playNote(523.25, now, 0.15)        // C5
    playNote(659.25, now + 0.08, 0.15)  // E5
    playNote(783.99, now + 0.16, 0.15)  // G5
    playNote(1046.50, now + 0.24, 0.3)  // C6 - triumphant high note
  } else if (type === 'wrong') {
    // Descending buzz
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2)
    oscillator.type = 'sawtooth'
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } else if (type === 'click') {
    // Quick click sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.type = 'square'
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.05)
  }
}

  const [feedback, setFeedback] = useState('')
  const [peppMessage, setPeppMessage] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [showManage, setShowManage] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [direction, setDirection] = useState('sv-target')
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [wordLists, setWordLists] = useState({
    weekly: weeklyWords,
    all: allWords,
    verbs: verbs
  })

  function normalizeAnswer(str) {
    let normalized = str.trim().replace(/ß/g, 'ss')
    return caseSensitive ? normalized : normalized.toLowerCase()
  }

  useEffect(() => {
    // Load word lists and settings from Supabase on mount
    async function loadData() {
      const [weekly, all, verbsList, settings] = await Promise.all([
        loadWordListFromDB('weeklyWords'),
        loadWordListFromDB('allWords'),
        loadWordListFromDB('verbs'),
        loadSettings()
      ])
      
      setWordLists({
        weekly: weekly.length ? weekly : weeklyWords,
        all: all.length ? all : allWords,
        verbs: verbsList.length ? verbsList : verbs
      })
      
      if (settings) {
        setSoundEnabled(settings.sound_enabled ?? true)
        setTargetLanguage(settings.target_language || 'en')
        setDirection(settings.direction || 'sv-target')
        setCaseSensitive(settings.case_sensitive ?? true)
      }
      
      setLoading(false)
    }
    loadData()
  }, [showManage, showSettings]) // Reload when returning from manage or settings page

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
    } catch (e) {}
  }


if (showManage) {
  return <ManagePage onBack={() => setShowManage(false)} />
}

if (showSettings) {
  return <SettingsPage onBack={() => setShowSettings(false)} />
}

if (loading) {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
      <div className="card">
        <h2 style={{ fontSize: '2rem', color: '#00d4ff' }}>Laddar glosor...</h2>
      </div>
    </div>
  );
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
      {/* Sign out button */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <button 
          onClick={() => signOut()}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          Sign Out ({user?.email})
        </button>
      </div>

      {!hasStarted ? (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: 16, textShadow: '0 0 40px rgba(0, 212, 255, 0.6), 0 2px 10px rgba(0,0,0,0.3)' }}>
            Glossify
          </h1>
          <p style={{ fontSize: '1.3rem', marginBottom: 50, opacity: 0.95, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            Välj din övning och börja plugga!
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', marginTop: 0 }}>
            <button
              className="modern-button main-action-button"
              onClick={() => startWithList(wordLists.weekly)}
            >
              Veckans glosor
            </button>
            <button 
              className="modern-button main-action-button"
              onClick={() => startWithList(wordLists.all)}
            >
              Alla glosor
            </button>
            <button 
              className="modern-button main-action-button"
              onClick={() => startWithList(wordLists.verbs)}
            >
              Verb
            </button>
            <button 
              className="modern-button main-action-button"
              onClick={() => { if (soundEnabled) playSound('click'); setShowManage(true); }}
            >
              Hantera glosor
            </button>
            <button 
              className="modern-button main-action-button"
              onClick={() => { if (soundEnabled) playSound('click'); setShowSettings(true); }}
            >
              Inställningar
            </button>
          </div>
        </div>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {current === null && hasStarted ? (
          <div className="card" style={{ textAlign: 'center', color: '#00d4ff' }}>
            <div style={{ fontSize: '0.9rem', color: '#ff6b6b', marginBottom: 8 }}>
              [Debug] queue.length: {queue.length}, hasStarted: {String(hasStarted)}
            </div>
            <h2 style={{ fontSize: '2.8rem', marginBottom: 24 }}>Övningen klar!</h2>
            <p style={{ fontSize: '1.4rem', marginBottom: 36, color: '#0099cc' }}>
              Du fick {score} av {totalAnswered} rätt! 
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <button
                onClick={() => startWithList(wordLists.weekly)}
                style={{
                  width: '100%',
                  fontSize: '1.3rem',
                  padding: '18px 40px',
                  borderRadius: '30px',
                  background: 'rgba(0, 212, 255, 0.15)',
                  color: '#00d4ff',
                  border: '2px solid rgba(0, 212, 255, 0.3)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)'
                  e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)'
                  e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Börja om - Veckans
              </button>
              <button
                onClick={() => startWithList(wordLists.all)}
                style={{
                  width: '100%',
                  fontSize: '1.3rem',
                  padding: '18px 40px',
                  borderRadius: '30px',
                  background: 'rgba(0, 212, 255, 0.15)',
                  color: '#00d4ff',
                  border: '2px solid rgba(0, 212, 255, 0.3)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)'
                  e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)'
                  e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Börja om - Alla
              </button>
              {wrongPairs.length > 0 && (
                <button
                  onClick={() => resetToWrong()}
                  style={{
                    width: '100%',
                    fontSize: '1.3rem',
                    padding: '18px 40px',
                    borderRadius: '30px',
                    background: 'rgba(0, 212, 255, 0.15)',
                    color: '#00d4ff',
                    border: '2px solid rgba(0, 212, 255, 0.3)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)'
                    e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.5)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)'
                    e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Öva fel svar ({wrongPairs.length})
                </button>
              )}
              <button
                style={{
                  width: '100%',
                  fontSize: '1.3rem',
                  padding: '18px 40px',
                  borderRadius: '30px',
                  background: 'rgba(0, 212, 255, 0.15)',
                  color: '#00d4ff',
                  border: '2px solid rgba(0, 212, 255, 0.3)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
                onClick={() => { playSound('click'); setHasStarted(false); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)'
                  e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)'
                  e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Avsluta övning
              </button>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 600 }}>
            {/* Main session content: Flashcard always at top */}
            <Flashcard current={current} onSubmit={handleSubmit} normalize={normalizeAnswer} direction={direction} />
            {(!peppMessage && feedback) && (
              <div
                className={feedback.startsWith('✓') ? 'feedback-success' : 'feedback-error'}
                style={{
                  marginTop: 20,
                  textAlign: 'center'
                }}
              >
                {feedback}
              </div>
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
              <button
                onClick={() => { playSound('click'); setHasStarted(false); }}
                style={{
                  width: '100%',
                  fontSize: '1.3rem',
                  padding: '18px 40px',
                  borderRadius: '30px',
                  background: 'rgba(0, 212, 255, 0.15)',
                  color: '#00d4ff',
                  border: '2px solid rgba(0, 212, 255, 0.3)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)'
                  e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)'
                  e.currentTarget.style.border = '2px solid rgba(0, 212, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Avsluta övning
              </button>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
}