'use client';

import { useEffect, useState } from 'react';
import ModeToggle from '../components/ModeToggle';
import WordChain from '../components/WordChain';
import WordInput from '../components/WordInput';
import ConfirmModal from '../components/ConfirmModal';
import { fetchStartWords, validateWord, fetchNextAIWord } from '../utils/api';

export default function Home() {
  const [start, setStart] = useState('');
  const [target, setTarget] = useState('');
  const [chain, setChain] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'solo' | 'vs-ai'>('solo');
  const [gameInProgress, setGameInProgress] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'solo' | 'vs-ai' | null>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async () => {
    try {
      const data = await fetchStartWords();
      setStart(data.start_word);
      setTarget(data.target_word);
      setChain([data.start_word]);
      setInput('');
      setMessage('');
      setGameInProgress(false);
    } catch (err) {
      setMessage('Failed to load start words.');
    }
  };

  const submitWord = async () => {
    const cleanedInput = input.trim().toLowerCase();
    const last = chain[chain.length - 1];
  
    if (!cleanedInput) return;
  
    if (chain.map(w => w.toLowerCase()).includes(cleanedInput)) {
      setMessage('✗ Word already used.');
      return;
    }
  
    if (cleanedInput === target.toLowerCase()) {
      setChain([...chain, input]);
      setMessage('🎉 You reached the target word!');
      setInput('');
      return;
    }
  
    try {
      const data = await validateWord(last, input);
  
      if (data.valid) {
        const newChain = [...chain, input];
        setChain(newChain);
        setGameInProgress(true);
        setInput('');
        setMessage('✓ Valid move');
  
        if (mode === 'vs-ai') {
          const aiData = await fetchNextAIWord(input, newChain);
          if (aiData.ai_word) {
            const aiWord = aiData.ai_word;
            if (aiWord.toLowerCase() === target.toLowerCase()) {
              setChain([...newChain, aiWord]);
              setMessage('😓 AI reached the target word!');
            } else {
              setChain([...newChain, aiWord]);
            }
          } else {
            setMessage('AI could not find a word.');
          }
        }
      } else {
        setMessage(data.reason || '✗ Not semantically close enough.');
      }
    } catch (err) {
      setMessage('Server error validating word.');
    }
  };

  const handleModeChange = (newMode: 'solo' | 'vs-ai') => {
    if (newMode === mode) return;

    if (gameInProgress) {
      setPendingMode(newMode);
      setShowModal(true);
      return;
    }

    switchMode(newMode);
  };

  const switchMode = (newMode: 'solo' | 'vs-ai') => {
    setMode(newMode);
    startNewGame();
  };

  return (
    <main className="container">
      <div className="card">
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <h1>Logical Link</h1>
        <p className="subtitle">
          Connect <strong>{start}</strong> → <strong>{target}</strong>
        </p>
        <WordChain chain={chain} />
        <WordInput input={input} setInput={setInput} onSubmit={submitWord} />
        {message && <p className="message">{message}</p>}
      </div>
      <ConfirmModal
        open={showModal}
        message="Switching modes will restart the game. Continue?"
        onConfirm={() => {
          if (pendingMode) switchMode(pendingMode);
          setShowModal(false);
          setPendingMode(null);
        }}
        onCancel={() => {
          setShowModal(false);
          setPendingMode(null);
        }}
      />
    </main>
  );
}
