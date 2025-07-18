'use client';

import { useEffect, useState } from 'react';
import './globals.css';

export default function Home() {
  const [start, setStart] = useState('');
  const [target, setTarget] = useState('');
  const [chain, setChain] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await fetch('http://localhost:8000/start-words');
        const data = await res.json();
        setStart(data.start_word);
        setTarget(data.target_word);
        setChain([data.start_word]);
      } catch (err) {
        setMessage('Failed to load start words.');
      }
    };
    fetchWords();
  }, []);

  const submitWord = async () => {
    const cleanedInput = input.trim().toLowerCase();
    const last = chain[chain.length - 1];

    if (!cleanedInput) return;

    if (cleanedInput === target.toLowerCase()) {
      setChain([...chain, input]);
      setMessage('🎉 You reached the target word!');
      setInput('');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/validate-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_word: last, next_word: input }),
      });
      const data = await res.json();

      if (data.valid) {
        setChain([...chain, input]);
        setInput('');
        setMessage('✓ Valid move');
      } else {
        setMessage(data.reason || '✗ Not semantically close enough.');
      }
    } catch (err) {
      setMessage('Server error validating word.');
    }
  };

  return (
    <main className="container">
      <div className="card">
        <h1>Logical Link</h1>
        <p className="subtitle">
          Connect <strong>{start}</strong> → <strong>{target}</strong>
        </p>
        <div className="chain-display">{chain.join(' → ')}</div>
        <div className="input-section">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter next word"
          />
          <button onClick={submitWord}>Submit</button>
        </div>
        {message && <p className="message">{message}</p>}
      </div>
    </main>
  );
}
