'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [start, setStart] = useState('');
  const [target, setTarget] = useState('');
  const [chain, setChain] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/start-words')
      .then((res) => res.json())
      .then((data) => {
        setStart(data.start_word);
        setTarget(data.target_word);
        setChain([data.start_word]);
      });
  }, []);

  const submitWord = async () => {
    const cleanedInput = input.trim().toLowerCase();
    const last = chain[chain.length - 1];
  
    if (cleanedInput === target.toLowerCase()) {
      setChain([...chain, input]);
      setMessage('🎉 You reached the target word!');
      setInput('');
      return; 
    }
  
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
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Logical Link</h1>
      <p>
        Connect <strong>{start}</strong> → <strong>{target}</strong>
      </p>
      <p>Current Chain: {chain.join(' → ')}</p>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter next word"
      />
      <button onClick={submitWord}>Submit</button>
      <p>{message}</p>
    </main>
  );
}
