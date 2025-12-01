import React from 'react';

export default function StreakMessage({ message, id }) {
  if (!message) return null;
  return (
    <div className="streak-message" id={id || undefined}>
      <strong>{message}</strong>
    </div>
  );
}
