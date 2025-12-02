import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import './SettingsPage.css';

const LANGUAGES = [
  { code: 'en', name: 'Engelska' },
  { code: 'de', name: 'Tyska' },
  { code: 'es', name: 'Spanska' }
]

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth()
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [direction, setDirection] = useState('sv-target')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(0.2) // 0.2 = 20%
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
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
        setVolume(typeof data.volume === 'number' ? data.volume : 0.2)
      }
      setLoading(false)
    } catch (e) {
      setMessage('Fel vid hämtning av inställningar')
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

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
          volume: volume,
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
        <h1 className="glossify-header">Inställningar</h1>

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
          <label className="toggle-switch" htmlFor="toggle-sound-enabled">
            <input
              id="toggle-sound-enabled"
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            <span className="slider"></span>
            <span className="toggle-label">{soundEnabled ? 'På' : 'Av'}</span>
          </label>
          <div style={{ marginTop: 18 }}>
            <label htmlFor="volume-slider" style={{ color: '#fff', fontWeight: 600, marginRight: 12 }}>
              Volym:
            </label>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              style={{ width: 180, verticalAlign: 'middle' }}
            />
            <span style={{ color: '#00d4ff', marginLeft: 10 }}>{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>Skiftlägeskänslig</h3>
          <p className="settings-description">Kräv exakt matchning av stora och små bokstäver</p>
          <label className="toggle-switch" htmlFor="toggle-case-sensitive">
            <input
              id="toggle-case-sensitive"
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
            className="modern-button main-action-button"
            data-testid="signout-btn"
            onClick={() => signOut()}
          >
            Logga ut
          </button>
          <button
            className="modern-button main-action-button"
            onClick={saveSettings}
          >
            Spara
          </button>
          <button
            className="modern-button main-action-button"
            onClick={() => navigate('/practice')}
          >
            Tillbaka
          </button>
        </div>
      </div>
    </div>
  )
}
