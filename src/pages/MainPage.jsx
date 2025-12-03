import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#112D54', alignItems: 'center' }}>
      <motion.h1
        className="glossify-header"
        aria-label="Glossify header wave"
        style={{ display: 'inline-block' }}
      >
        {['G','l','o','s','s','i','f','y'].map((ch, i) => (
          <motion.span
            key={i}
            style={{ display: 'inline-block' }}
            animate={{ y: [0, -4, 0, 4, 0] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.08
            }}
          >
            {ch}
          </motion.span>
        ))}
      </motion.h1>
      <p style={{ fontSize: '1.3rem', marginBottom: 50, opacity: 0.95, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
        Välj din övning och börja plugga!
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', marginTop: 0 }}>
        <button id="veckans-glosor-btn" className="modern-button main-action-button" onClick={() => navigate('/practice/weekly')}>
          Veckans glosor
        </button>
        <button id="alla-glosor-btn" className="modern-button main-action-button" onClick={() => navigate('/practice/all')}>
          Alla glosor
        </button>
        <button id="verb-btn" className="modern-button main-action-button" onClick={() => navigate('/practice/verbs')}>
          Verb
        </button>
        <button id="hantera-glosor-btn" className="modern-button main-action-button" onClick={() => navigate('/manage')}>
          Hantera glosor
        </button>
        <button id="installningar-btn" className="modern-button main-action-button" onClick={() => navigate('/settings')}>Inställningar</button>
      </div>
    </div>
  );
}
