'use client';
import React from 'react';

interface Props {
  mode: 'solo' | 'vs-ai';
  onModeChange: (mode: 'solo' | 'vs-ai') => void;
}

export default function ModeToggle({ mode, onModeChange }: Props) {
  return (
    <div className="mode-toggle">
      <label>
        <input
          type="radio"
          checked={mode === 'solo'}
          onChange={() => onModeChange('solo')}
        />
        Solo
      </label>
      <label>
        <input
          type="radio"
          checked={mode === 'vs-ai'}
          onChange={() => onModeChange('vs-ai')}
        />
        Vs AI
      </label>
    </div>
  );
}
