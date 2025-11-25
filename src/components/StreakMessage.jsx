import React from 'react';

export default function StreakMessage({ message }) {
  if (!message) return null;
  return (
    <div className="streak-message">
      <strong>{message}</strong>
    </div>
  );
}
