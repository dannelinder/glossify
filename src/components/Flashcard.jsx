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
        fontSize: '1.3rem',
        padding: '18px 40px',
        borderRadius: '30px',
        border: '2px solid rgba(0, 212, 255, 0.3)',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#112D54',
        fontWeight: '600',
        marginBottom: 8,
        transition: 'all 0.3s ease',
        width: '100%'
      }}
      onFocus={(e) => e.target.style.border = '2px solid #00d4ff'}
      onBlur={(e) => e.target.style.border = '2px solid rgba(0, 212, 255, 0.3)'}
    />
    <button
      type="submit"
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
      ✓ Svara
    </button>
  </form>
</div>
)
}