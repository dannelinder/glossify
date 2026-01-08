import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadWordListFromDB, saveWordListToDB } from '../utils/wordListHelpers';

export default function ManagePage() {
  const navigate = useNavigate();
  const [weeklyText, setWeeklyText] = useState('')
  const [allText, setAllText] = useState('')
  const [verbsText, setVerbsText] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load existing data from Firestore
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
      
      // Save all three lists to Firestore
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
          <h1 className="glossify-header">Laddar glosor...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="manage-container">
      <div className="card">
        <h2 className="glossify-header">Hantera glosor</h2>
        <p className="manage-description">
          Från svenska till det språk du valt i inställningar (ett ord per rad)<br />
          <code className="example-code">svenska;engelska</code>, <code className="example-code">svenska;tyska</code> eller <code className="example-code">svenska;spanska</code>
        </p>


        <div className="manage-section">
          <h3>Veckans glosor</h3>
            <textarea
              id="weekly-textarea"
              className="main-textarea"
              value={weeklyText}
              onChange={(e) => setWeeklyText(e.target.value)}
              placeholder="hund;dog"
            />
        </div>

        <div className="manage-section">
          <h3>Alla glosor</h3>
            <textarea
              id="all-textarea"
              className="main-textarea"
              value={allText}
              onChange={(e) => setAllText(e.target.value)}
              placeholder="hus;house"
            />
        </div>

        <div className="manage-section">
          <h3>Verb</h3>
            <textarea
              id="verbs-textarea"
              className="main-textarea"
              value={verbsText}
              onChange={(e) => setVerbsText(e.target.value)}
              placeholder="springa;laufen"
            />
        </div>



        <div className="manage-actions">
          <button
            id="spara-btn"
            className="modern-button main-action-button"
            onClick={handleSave}
          >
            Spara
          </button>
          <button
            id="tillbaka-btn"
            className="modern-button main-action-button"
            onClick={() => navigate('/practice')}
          >
            Tillbaka
          </button>
        </div>

        {message && (
          <div className={message.startsWith('✓') ? 'feedback-success' : 'feedback-error'}>
            {message}
          </div>
        )}


      </div>
    </div>
  );
}
