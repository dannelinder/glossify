import React, { useState, useEffect } from 'react'


export default function Flashcard({ current, onSubmit, normalize, direction = 'sv-target' }) {
const [input, setInput] = useState('')


useEffect(() => {
setInput('')
}, [current])


if (!current) return null

// Determine which property to show based on direction
const question = direction === 'sv-target' ? current.sv : current.ty
const answer = direction === 'sv-target' ? current.ty : current.sv


function handleSubmit(e) {
e.preventDefault()
onSubmit(input)
}


return (
<div className="card" style={{ textAlign: 'center' }}>
  <div style={{ 
    fontSize: '3.5rem', 
    marginBottom: 36, 
    fontWeight: '700',
    color: '#00d4ff',
    textShadow: '0 2px 8px rgba(0, 212, 255, 0.4)'
  }}>
    {question}
  </div>
  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <input
      autoFocus
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Skriv ditt svar här..."
      style={{ 
        fontSize: '1.4rem', 
        padding: '16px 24px',
        borderRadius: '16px',
        border: '2px solid rgba(0, 212, 255, 0.3)',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#333',
        fontWeight: '500',
        transition: 'all 0.3s ease'
      }}
      onFocus={(e) => e.target.style.border = '2px solid #00d4ff'}
      onBlur={(e) => e.target.style.border = '2px solid rgba(0, 212, 255, 0.3)'}
    />
    <button 
      type="submit"
      className="modern-button"
      style={{ 
        fontSize: '1.4rem',
        padding: '18px'
      }}
    >
      ✓ Svara
    </button>
  </form>
</div>
)
}