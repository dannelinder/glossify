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
      <div className="manage-container">
        <div className="card">
          <h1 className="manage-title">Laddar glosor...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="manage-container">
      <div className="card">
        <h1 className="manage-title">Hantera glosor</h1>
        <p className="manage-description">
          Från svenska till det språk du valt i inställningar (ett ord per rad)<br />
          <code className="example-code">svenska;engelska</code>, <code className="example-code">svenska;tyska</code> eller <code className="example-code">svenska;spanska</code>
        </p>


        <div className="manage-section">
          <h3>Veckans glosor</h3>
          <textarea
            className="main-textarea"
            value={weeklyText}
            onChange={(e) => setWeeklyText(e.target.value)}
            placeholder="hund;dog"
          />
        </div>

        <div className="manage-section">
          <h3>Alla glosor</h3>
          <textarea
            className="main-textarea"
            value={allText}
            onChange={(e) => setAllText(e.target.value)}
            placeholder="hus;house"
          />
        </div>

        <div className="manage-section">
          <h3>Verb</h3>
          <textarea
            className="main-textarea"
            value={verbsText}
            onChange={(e) => setVerbsText(e.target.value)}
            placeholder="springa;run"
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

        <div className="manage-actions">
          <button
            className="modern-button main-action-button"
            onClick={handleSave}
          >
            Spara
          </button>
          <button
            className="modern-button main-action-button"
            onClick={onBack}
          >
            Tillbaka
          </button>
        </div>

        {message && (
          <div className={message.startsWith('✓') ? 'feedback-success' : 'feedback-error'}>
            {message}
          </div>
        )}

        {/* Buttons moved above, duplicate removed */}
      </div>
    </div>
  );
}
