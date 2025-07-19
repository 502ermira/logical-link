'use client';

import { useEffect, useState } from 'react';
import ModeToggle from '../components/ModeToggle';
import WordChain from '../components/WordChain';
import WordInput from '../components/WordInput';
import ConfirmModal from '../components/ConfirmModal';
import { fetchStartWords, validateWord, fetchNextAIWord } from '../utils/api';

const PLAYER_COLORS = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-purple-500'];

export default function Home() {
  const [start, setStart] = useState('');
  const [target, setTarget] = useState('');
  const [chain, setChain] = useState<{ word: string; playerIndex: number | null }[]>([]);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'solo' | 'vs-ai' | 'multiplayer'>('solo');
  const [gameInProgress, setGameInProgress] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'solo' | 'vs-ai' | 'multiplayer' | null>(null);

  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);

  useEffect(() => {
    if (mode === 'multiplayer') {
      setShowPlayerSetup(true);
    } else {
      startNewGame();
    }
  }, [mode]);

  const startNewGame = async (playerList: string[] = []) => {
    try {
      const data = await fetchStartWords();
      setStart(data.start_word);
      setTarget(data.target_word);
      setChain([{ word: data.start_word, playerIndex: null }]);
      setInput('');
      setMessage('');
      setGameInProgress(false);
      setPlayers(playerList);
      setCurrentPlayer(0);
    } catch (err) {
      setMessage('Failed to load start words.');
    }
  };

  const submitWord = async () => {
    const cleanedInput = input.trim().toLowerCase();
    const last = chain[chain.length - 1].word;

    if (!cleanedInput) return;

    if (chain.map(w => w.word.toLowerCase()).includes(cleanedInput)) {
      setMessage('✗ Word already used.');
      return;
    }

    if (cleanedInput === target.toLowerCase()) {
      const newEntry = { word: input, playerIndex: mode === 'multiplayer' ? currentPlayer : null };
      setChain([...chain, newEntry]);
      setMessage(mode === 'multiplayer'
        ? `🎉 ${players[currentPlayer]} wins!`
        : '🎉 You reached the target word!');
      setInput('');
      return;
    }

    try {
      const data = await validateWord(last, input);

      if (data.valid) {
        const newEntry = { word: input, playerIndex: mode === 'multiplayer' ? currentPlayer : null };
        const newChain = [...chain, newEntry];
        setChain(newChain);
        setGameInProgress(true);
        setInput('');
        setMessage('✓ Valid move');

        if (mode === 'vs-ai') {
          const aiData = await fetchNextAIWord(input, newChain.map(w => w.word));
          if (aiData.ai_word) {
            const aiWord = aiData.ai_word;
            if (aiWord.toLowerCase() === target.toLowerCase()) {
              setChain([...newChain, { word: aiWord, playerIndex: null }]);
              setMessage('😓 AI reached the target word!');
            } else {
              setChain([...newChain, { word: aiWord, playerIndex: null }]);
            }
          } else {
            setMessage('AI could not find a word.');
          }
        }

        if (mode === 'multiplayer') {
          setCurrentPlayer((prev) => (prev + 1) % players.length);
        }

      } else {
        setMessage(data.reason || '✗ Not semantically close enough.');
      }
    } catch (err) {
      setMessage('Server error validating word.');
    }
  };

  const handleModeChange = (newMode: typeof mode) => {
    if (newMode === mode) return;

    if (gameInProgress) {
      setPendingMode(newMode);
      setShowModal(true);
      return;
    }

    switchMode(newMode);
  };

  const switchMode = (newMode: typeof mode) => {
    setMode(newMode);
    if (newMode !== 'multiplayer') startNewGame();
  };

  const handlePlayerSetup = (names: string[]) => {
    setShowPlayerSetup(false);
    startNewGame(names);
  };

  return (
    <main className="container p-4">
      <div className="card border p-4 max-w-xl mx-auto shadow-md bg-white dark:bg-gray-900">
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <h1 className="text-2xl font-bold mb-2">Logical Link</h1>
        <p className="subtitle mb-4">
          Connect <strong>{start}</strong> → <strong>{target}</strong>
        </p>
        <WordChain chain={chain} playerColors={PLAYER_COLORS} players={players} />
        {mode === 'multiplayer' && players.length > 0 && (
          <p className="mb-2 font-semibold">
            Current: <span className={PLAYER_COLORS[currentPlayer]}>{players[currentPlayer]}</span>
          </p>
        )}
        <WordInput
          input={input}
          setInput={setInput}
          onSubmit={submitWord}
          disabled={mode === 'multiplayer' && players.length > 0 && chain.length > 1 && message.includes('wins')}
        />
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>

      {showPlayerSetup && (
        <PlayerSetupModal onStart={handlePlayerSetup} onCancel={() => setMode('solo')} />
      )}

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

function PlayerSetupModal({ onStart, onCancel }: { onStart: (names: string[]) => void, onCancel: () => void }) {
  const [names, setNames] = useState(['', '', '', '']);

  const handleSubmit = () => {
    const filtered = names.map(n => n.trim()).filter(n => n);
    if (filtered.length >= 2) {
      onStart(filtered);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2">Enter Player Names (2–4)</h2>
        {names.map((name, i) => (
          <input
            key={i}
            className="block w-full mb-2 p-2 border"
            placeholder={`Player ${i + 1}`}
            value={name}
            onChange={(e) => {
              const newNames = [...names];
              newNames[i] = e.target.value;
              setNames(newNames);
            }}
          />
        ))}
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-300 rounded" onClick={onCancel}>Cancel</button>
          <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={handleSubmit}>Start</button>
        </div>
      </div>
    </div>
  );
}