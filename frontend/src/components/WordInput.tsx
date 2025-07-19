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
    <div className="flex gap-2 mb-4">
      <input
        className="flex-1 p-2 border rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter next word"
        disabled={disabled}
      />
      <button
        className="px-4 bg-blue-500 text-white rounded"
        onClick={onSubmit}
        disabled={disabled}
      >
        Submit
      </button>
    </div>
  );
}