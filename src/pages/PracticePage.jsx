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

  const [feedback, setFeedback] = useState('')
  const [hasPepp, setHasPepp] = useState(false)
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

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error loading settings:', error)
      return null
    }
  }

  function startWithList(words) {
    if (soundEnabled) playSound('click')
    loadWords(words)
    setHasStarted(true)
  }

  function handleSubmit(userInput) {
    // Pre-calculate if there will be a pepp message for correct answer
    const pepMsg = getPepp(streak + 1)
    const isPepp = !!pepMsg
    // Check if it's a rare pepp (streak milestone: 3, 5, 10, 15, 20, 25)
    const isRarePepp = [3, 5, 10, 15, 20, 25].includes(streak + 1) && isPepp
    const correctDelay = isPepp ? 3200 : 1200
    
    answerCurrent(userInput, normalizeAnswer, (correct, card) => {
      // Determine the correct answer based on direction
      const correctAnswer = direction === 'sv-target' ? card.ty : card.sv
      
      if (correct) {
        if (soundEnabled) playSound(isRarePepp ? 'pepp' : 'correct')
        setHasPepp(isRarePepp)
        setFeedback(pepMsg ? `✓ Rätt! ${pepMsg}` : '✓ Rätt!')
        setTimeout(() => setFeedback(''), correctDelay)
      } else {
        if (soundEnabled) playSound('wrong')
        setHasPepp(false)
        setFeedback(`✗ Fel, rätt svar är: ${correctAnswer}`)
        setTimeout(() => setFeedback(''), 1200)
      }
    }, correctDelay, direction)
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
  )
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
              onClick={() => startWithList(wordLists.weekly)}
              style={{ 
                width: '340px', 
                fontSize: '1.5rem',
                padding: '22px 45px',
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
              Veckans glosor
            </button>
            <button 
              onClick={() => startWithList(wordLists.all)}
              style={{
                width: '340px',
                fontSize: '1.5rem',
                padding: '22px 45px',
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
              Alla glosor
            </button>
            <button 
              onClick={() => startWithList(wordLists.verbs)}
              style={{
                width: '340px',
                fontSize: '1.5rem',
                padding: '22px 45px',
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
              Verb
            </button>
            <button 
              onClick={() => { if (soundEnabled) playSound('click'); setShowManage(true); }}
              style={{
                width: '340px',
                fontSize: '1.5rem',
                padding: '22px 45px',
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
              Hantera glosor
            </button>
            <button 
              onClick={() => { if (soundEnabled) playSound('click'); setShowSettings(true); }}
              style={{
                width: '340px',
                fontSize: '1.5rem',
                padding: '22px 45px',
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
              Inställningar
            </button>
          </div>
        </div>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ width: '100%', maxWidth: 600 }}>
          {current ? (
            <>
              <Flashcard current={current} onSubmit={handleSubmit} normalize={normalizeAnswer} direction={direction} />
              
              {feedback && (
                <div 
                  className={feedback.startsWith('✓') ? 'feedback-success' : 'feedback-error'} 
                  style={{ 
                    marginTop: 20, 
                    textAlign: 'center',
                    ...(hasPepp && feedback.startsWith('✓') ? {
                      background: 'linear-gradient(135deg, #00ff88 0%, #00ffcc 100%)',
                      boxShadow: '0 0 30px rgba(0, 255, 136, 0.8), 0 6px 20px rgba(0, 255, 204, 0.6)',
                      transform: 'scale(1.05)',
                      animation: 'pulse 0.5s ease',
                      color: '#000'
                    } : {})
                  }}
                >
                  {feedback}
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', color: '#00d4ff' }}>
              <h2 style={{ fontSize: '2.8rem', marginBottom: 24 }}>Övningen klar!</h2>
              <p style={{ fontSize: '1.4rem', marginBottom: 36, color: '#0099cc' }}>
                Du fick {score} av {totalAnswered} rätt! 
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                <button 
                  onClick={() => startWithList(wordLists.weekly)}
                  style={{ 
                    width: '280px',
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)'
                  }}
                >
                  Börja om - Veckans
                </button>
                <button 
                  onClick={() => startWithList(wordLists.all)}
                  style={{ 
                    width: '280px',
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  Börja om - Alla
                </button>
                {wrongPairs.length > 0 && (
                  <button 
                    onClick={() => resetToWrong()}
                    style={{ 
                      width: '280px',
                      padding: '16px 32px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)'
                    }}
                  >
                    Öva fel svar ({wrongPairs.length})
                  </button>
                )}
                <button 
                  onClick={() => { if (soundEnabled) playSound('click'); setHasStarted(false); }}
                  style={{ 
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    background: 'transparent',
                    color: '#667eea',
                    borderRadius: '12px',
                    border: '2px solid #667eea',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginTop: 8
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  Tillbaka
                </button>
              </div>
            </div>
          )}

          {current && (
            <>
              <div style={{ marginTop: 24 }}>
                <ProgressBar value={totalAnswered} max={queue.length} />
              </div>

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

              <div style={{ marginTop: 24, textAlign: 'center' }}>
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
            </>
          )}
        </div>
      </div>
      )}
    </div>
  )
}