import React from 'react'


export default function StreakMessage({ streak, message }) {
	if (!message) return null;
	return (
		<div className="streak-message">
			<strong>{message}</strong>
			{streak !== null && streak !== undefined && (
				<div style={{ fontSize: 12, color: '#666' }}>Streak: {streak}</div>
			)}
		</div>
	);
}