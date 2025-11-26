import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#112D54', alignItems: 'center' }}>
      <h1 className="glossify-header">
        Glossify
      </h1>
      <p style={{ fontSize: '1.3rem', marginBottom: 50, opacity: 0.95, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
        Välj din övning och börja plugga!
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', marginTop: 0 }}>
        <button className="modern-button main-action-button" onClick={() => navigate('/practice/weekly')}>
          Veckans glosor
        </button>
        <button className="modern-button main-action-button" onClick={() => navigate('/practice/all')}>
          Alla glosor
        </button>
        <button className="modern-button main-action-button" onClick={() => navigate('/practice/verbs')}>
          Verb
        </button>
        <button className="modern-button main-action-button" onClick={() => navigate('/manage')}>
          Hantera glosor
        </button>
        <button className="modern-button main-action-button" onClick={() => navigate('/settings')}>
          Inställningar
        </button>
      </div>
    </div>
  );
}
