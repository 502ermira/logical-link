'use client';
import React from 'react';

interface Props {
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
}

export default function WordInput({ input, setInput, onSubmit }: Props) {
  return (
    <div className="input-section">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter next word"
      />
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
}
