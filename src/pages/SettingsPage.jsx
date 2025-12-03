import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
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
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false)
    } catch (e) {
      setMessage('Fel vid hämtning av inställningar')
      setLoading(false)
    }
  }, [user])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate file size (max 1 MB)
    const maxSize = 1024 * 1024; // 1 MB
    if (file.size > maxSize) {
      setMessage('Filen är för stor (max 1 MB)');
      return;
    }
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Endast JPG och PNG tillåts');
      return;
    }
    setUploading(true);
    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    // Remove previous avatar if exists (by URL in user_settings)
    let previousAvatarUrl = avatarUrl;
    if (previousAvatarUrl) {
      // Extract filename from URL
      const parts = previousAvatarUrl.split('/');
      const prevFile = parts[parts.length - 1];
      await supabase.storage.from('avatars').remove([prevFile]);
    }
    // Generate unique filename
    const fileName = `${user.id}-${uuidv4()}.${ext}`;
    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);
    if (uploadError) {
      setMessage('Fel vid uppladdning av avatar: ' + (uploadError.message || 'okänt fel'));
      setUploading(false);
      return;
    }
    const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(fileName).data;
    setAvatarUrl(publicUrl);
    // Save avatar URL to user_settings
    await supabase.from('user_settings').update({ avatar_url: publicUrl }).eq('user_id', user.id);
    setUploading(false);
    setMessage('Avatar uppdaterad!');
  };

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
          avatar_url: avatarUrl,
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

        {/* Profile section */}
        <div className="settings-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt="Avatar"
            className="avatar-img"
            width={96}
            height={96}
            style={{ borderRadius: '50%', border: '3px solid #00d4ff', marginBottom: 12, background: '#fff' }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <label style={{ display: 'inline-block', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
              <span style={{
                display: 'inline-block',
                background: '#00d4ff',
                color: '#112D54',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: 15,
                opacity: uploading ? 0.6 : 1
              }}>
                Välj bild
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>
            Max 1 MB. Tillåtna format: JPG, PNG.
          </div>
          {uploading && <span>Laddar upp...</span>}
          <div style={{ color: '#fff', fontWeight: 600, marginTop: 8 }}>Email: {user.email}</div>
        </div>

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
