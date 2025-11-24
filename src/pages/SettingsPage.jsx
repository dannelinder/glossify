import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './SettingsPage.css'

const LANGUAGES = [
  { code: 'en', name: 'Engelska' },
  { code: 'de', name: 'Tyska' },
  { code: 'es', name: 'Spanska' }
]

export default function SettingsPage({ onBack }) {
  const { user } = useAuth()
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [direction, setDirection] = useState('sv-target')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setTargetLanguage(data.target_language || 'en')
        setDirection(data.direction || 'sv-target')
        setSoundEnabled(data.sound_enabled ?? true)
        setCaseSensitive(data.case_sensitive ?? true)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setMessage('Sparar...')
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          target_language: targetLanguage,
          direction: direction,
          sound_enabled: soundEnabled,
          case_sensitive: caseSensitive,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      setMessage('✓ Inställningar sparade!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('✗ Kunde inte spara inställningar')
    }
  }

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-card">
          <h2>Laddar inställningar...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1>Inställningar</h1>

        <div className="settings-section">
          <h3>Språk</h3>
          <p className="settings-description">Vilket språk översätter du till från svenska?</p>
          <div className="language-options">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`language-option ${targetLanguage === lang.code ? 'active' : ''}`}
                onClick={() => setTargetLanguage(lang.code)}
              >
                <span className="flag">{lang.flag}</span>
                <span className="language-name">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Riktning</h3>
          <p className="settings-description">Vilken riktning vill du öva?</p>
          <div className="language-options">
            <button
              className={`language-option ${direction === 'sv-target' ? 'active' : ''}`}
              onClick={() => setDirection('sv-target')}
            >
              <span className="language-name">Svenska → {LANGUAGES.find(l => l.code === targetLanguage)?.name}</span>
            </button>
            <button
              className={`language-option ${direction === 'target-sv' ? 'active' : ''}`}
              onClick={() => setDirection('target-sv')}
            >
              <span className="language-name">{LANGUAGES.find(l => l.code === targetLanguage)?.name} → Svenska</span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Ljudeffekter</h3>
          <p className="settings-description">Spela ljud vid rätt och fel svar</p>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            <span className="slider"></span>
            <span className="toggle-label">{soundEnabled ? 'På' : 'Av'}</span>
          </label>
        </div>

        <div className="settings-section">
          <h3>Skiftlägeskänslig</h3>
          <p className="settings-description">Kräv exakt matchning av stora och små bokstäver</p>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            <span className="slider"></span>
            <span className="toggle-label">{caseSensitive ? 'På' : 'Av'}</span>
          </label>
        </div>

        {message && (
          <div className={`settings-message ${message.startsWith('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="settings-actions" style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', marginTop: 0 }}>
          <button
            onClick={saveSettings}
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
            Spara inställningar
          </button>
          <button
            onClick={onBack}
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
            Tillbaka
          </button>
        </div>
      </div>
    </div>
  )
}
