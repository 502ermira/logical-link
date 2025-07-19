'use client';
import React from 'react';

type Props = {
  mode: 'solo' | 'vs-ai' | 'multiplayer';
  onModeChange: (mode: 'solo' | 'vs-ai' | 'multiplayer') => void;
};

export default function ModeToggle({ mode, onModeChange }: Props) {
  return (
    <div className="flex gap-4 mb-4">
      <label>
        <input
          type="radio"
          checked={mode === 'solo'}
          onChange={() => onModeChange('solo')}
        /> Solo
      </label>
      <label>
        <input
          type="radio"
          checked={mode === 'vs-ai'}
          onChange={() => onModeChange('vs-ai')}
        /> Vs AI
      </label>
      <label>
        <input
          type="radio"
          checked={mode === 'multiplayer'}
          onChange={() => onModeChange('multiplayer')}
        /> Multiplayer
      </label>
    </div>
  );
}