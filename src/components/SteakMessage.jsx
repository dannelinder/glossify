import React from 'react'


export default function StreakMessage({ streak, message }) {
if (!message) return null
return (
<div style={{ marginTop: 8, padding: 8, background: '#f0f8ff', borderRadius: 6 }}>
<strong>{message}</strong>
<div style={{ fontSize: 12, color: '#666' }}>Streak: {streak}</div>
</div>
)
}