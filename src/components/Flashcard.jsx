import React, { useState, useEffect } from 'react'
import { getPartialPromptInfo } from '../utils/pronounHelper'


export default function Flashcard({ current, onSubmit, normalize, direction = 'sv-target', isVerbMode = false }) {
const [input, setInput] = useState('')


useEffect(() => {
setInput('')
}, [current])


if (!current) return null

// Check if we should use partial prompts for verb practice
const partialPromptInfo = isVerbMode ? getPartialPromptInfo(current, direction) : null

// Determine which property to show based on direction and verb mode
let question, displayPrompt
if (partialPromptInfo) {
  question = partialPromptInfo.question
  displayPrompt = partialPromptInfo.prompt
} else {
  question = direction === 'sv-target' ? current.sv : current.ty
  displayPrompt = question
}

function handleSubmit(e) {
e.preventDefault()
// Pass the partial prompt info along with the answer for proper validation
onSubmit(input, partialPromptInfo)
}


return (
<div className="card" style={{ textAlign: 'center' }}>
  <div
    id="flashcard-front"
    style={{ 
      fontSize: '2.3rem', 
      marginBottom: 16, 
      fontWeight: '700',
      color: '#00d4ff',
      textShadow: '0 2px 8px rgba(0, 212, 255, 0.4)'
    }}
  >
    {question}
  </div>
  {partialPromptInfo && (
    <div
      id="flashcard-prompt"
      style={{ 
        fontSize: '1.8rem', 
        marginBottom: 16, 
        fontWeight: '600',
        color: '#0099cc',
        fontStyle: 'italic'
      }}
    >
      {displayPrompt}
    </div>
  )}
  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <input
      id="svar"
      autoFocus
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={isVerbMode && !partialPromptInfo ? "Skriv verbet..." : partialPromptInfo ? "Skriv bara verbet..." : "Skriv ditt svar här..."}
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
      id="svara-btn"
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