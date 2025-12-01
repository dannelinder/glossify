import React from 'react'


export default function ProgressBar({ value, max }) {
const pct = max > 0 ? Math.round((value / max) * 100) : 0
return (
  <div style={{ width: '100%', marginTop: 12 }}>
    <div
      data-testid="progress-bar"
      style={{
        height: 24,
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 14,
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
        border: '2px solid rgba(0, 212, 255, 0.2)'
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #00d4ff 0%, #00ffcc 100%)',
          transition: 'width 0.4s ease',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)'
        }}
      />
    </div>
    <div
      style={{
        marginTop: 10,
        fontSize: '1.1rem',
        fontWeight: '700',
        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }}
    >
      {value} / {max} ({pct}%)
    </div>
  </div>
)
}