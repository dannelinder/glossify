import React, { useState, useEffect } from 'react'
import { loadWordListFromDB, saveWordListToDB } from '../utils/wordListHelpers'

export default function ManagePage({ onBack }) {
  const [weeklyText, setWeeklyText] = useState('')
  const [allText, setAllText] = useState('')
  const [verbsText, setVerbsText] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load existing data from Supabase
    async function loadData() {
      setLoading(true)
      const [weekly, all, verbs] = await Promise.all([
        loadWordListFromDB('weeklyWords'),
        loadWordListFromDB('allWords'),
        loadWordListFromDB('verbs')
      ])
      
      // Convert back to text format
      if (weekly.length) setWeeklyText(weekly.map(w => `${w.sv};${w.ty}`).join('\n'))
      if (all.length) setAllText(all.map(w => `${w.sv};${w.ty}`).join('\n'))
      if (verbs.length) setVerbsText(verbs.map(w => `${w.sv};${w.ty}`).join('\n'))
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSave = async () => {
    try {
      setMessage('Sparar...')
      
      // Save all three lists to Supabase
      const results = await Promise.all([
        weeklyText.trim() ? saveWordListToDB('weeklyWords', weeklyText) : Promise.resolve(true),
        allText.trim() ? saveWordListToDB('allWords', allText) : Promise.resolve(true),
        verbsText.trim() ? saveWordListToDB('verbs', verbsText) : Promise.resolve(true)
      ])
      
      if (results.every(r => r)) {
        setMessage('✓ Sparat! Glosorna är nu tillgängliga på alla dina enheter.')
        setTimeout(() => setMessage(''), 4000)
      } else {
        setMessage('✗ Kunde inte spara alla listor. Försök igen.')
      }
    } catch (error) {
      setMessage('✗ Kunde inte spara. Försök igen.')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, textAlign: 'center' }}>
        <div className="card">
          <h1 style={{ color: '#00d4ff' }}>Laddar glosor...</h1>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, minHeight: '100vh' }}>
      <div className="card">
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: 12, 
          color: '#00d4ff',
          textAlign: 'center'
        }}>
          Hantera glosor
        </h1>
        <p style={{ 
          color: '#0099cc', 
          marginBottom: 32, 
          fontSize: '1.1rem',
          textAlign: 'center'
        }}>
          Från svenska till det språk du valt i inställningar (ett ord per rad)<br />
          <code style={{ 
            background: 'rgba(0, 212, 255, 0.1)', 
            padding: '4px 8px', 
            borderRadius: '6px',
            color: '#00d4ff',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>svenska;engelska</code>, <code style={{ 
            background: 'rgba(0, 212, 255, 0.1)', 
            padding: '4px 8px', 
            borderRadius: '6px',
            color: '#00d4ff',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>svenska;tyska</code> eller <code style={{ 
            background: 'rgba(0, 212, 255, 0.1)', 
            padding: '4px 8px', 
            borderRadius: '6px',
            color: '#00d4ff',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>svenska;spanska</code>
        </p>

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ 
            fontSize: '1.4rem', 
            marginBottom: 12,
            color: '#00d4ff',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            Veckans glosor
          </h3>
          <textarea
            value={weeklyText}
            onChange={(e) => setWeeklyText(e.target.value)}
            placeholder="katt;cat"
            style={{
              width: '100%',
              minHeight: 160,
              padding: '18px 40px',
              fontSize: '1.3rem',
              fontFamily: 'monospace',
              borderRadius: '30px',
              border: '2px solid rgba(0, 212, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#112D54',
              fontWeight: 600,
              textAlign: 'center',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ 
            fontSize: '1.4rem', 
            marginBottom: 12,
            color: '#00d4ff',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            Alla glosor
          </h3>
          <textarea
            value={allText}
            onChange={(e) => setAllText(e.target.value)}
            placeholder="hund;dog"
            style={{
              width: '100%',
              minHeight: 160,
              padding: '18px 40px',
              fontSize: '1.3rem',
              fontFamily: 'monospace',
              borderRadius: '30px',
              border: '2px solid rgba(0, 212, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#112D54',
              fontWeight: 600,
              textAlign: 'center',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ 
            fontSize: '1.4rem', 
            marginBottom: 12,
            color: '#00d4ff',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            Verb
          </h3>
          <textarea
            value={verbsText}
            onChange={(e) => setVerbsText(e.target.value)}
            placeholder="springa;run"
            style={{
              width: '100%',
              minHeight: 160,
              padding: '18px 40px',
              fontSize: '1.3rem',
              fontFamily: 'monospace',
              borderRadius: '30px',
              border: '2px solid rgba(0, 212, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#112D54',
              fontWeight: 600,
              textAlign: 'center',
              resize: 'vertical'
            }}
          />
        </div>

        {message && (
          <div className={message.startsWith('✓') ? 'feedback-success' : 'feedback-error'} style={{ 
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button 
            onClick={handleSave}
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
            Spara
          </button>
          <button 
            onClick={onBack}
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
            Tillbaka
          </button>
        </div>
      </div>
    </div>
  )
}
