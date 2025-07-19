'use client';
import React from 'react';

type Props = {
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function WordInput({ input, setInput, onSubmit, disabled = false }: Props) {
  return (
    <div className="input-section">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter next word"
        disabled={disabled}
      />
      <button onClick={onSubmit} disabled={disabled}>
        Submit
      </button>
    </div>
  );
}
