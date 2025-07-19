'use client';

import { useEffect, useState } from 'react';
import ModeToggle from '../components/ModeToggle';
import WordChain from '../components/WordChain';
import WordInput from '../components/WordInput';
import ConfirmModal from '../components/ConfirmModal';
import { fetchStartWords, validateWord, fetchNextAIWord } from '../utils/api';

const PLAYER_COLORS = ['red', 'blue', 'green', 'purple'];

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
  const [playerCount, setPlayerCount] = useState<number | null>(null);

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
    setPlayerCount(null);
    startNewGame(names);
  };

  return (
    <main className="container">
      <div className="card">
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        <h1>Logical Link</h1>
        <p className="subtitle">
          Connect <strong>{start}</strong> → <strong>{target}</strong>
        </p>

        <WordChain chain={chain} playerColors={PLAYER_COLORS} players={players} />

        {mode === 'multiplayer' && players.length > 0 && (
          <p className="subtitle">
            Current: <span className={`text-${PLAYER_COLORS[currentPlayer]}-500`}>{players[currentPlayer]}</span>
          </p>
        )}

        <WordInput
          input={input}
          setInput={setInput}
          onSubmit={submitWord}
          disabled={mode === 'multiplayer' && players.length > 0 && chain.length > 1 && message.includes('wins')}
        />

        {message && <p className="message">{message}</p>}
      </div>

      {showPlayerSetup && (
        playerCount === null
          ? <PlayerCountSelect 
              onSelect={setPlayerCount} 
              onCancel={() => {
                setMode('solo');
                setShowPlayerSetup(false);
                startNewGame();
              }} 
            />
          : <PlayerNameInput 
              count={playerCount} 
              onStart={handlePlayerSetup} 
              onCancel={() => {
                setMode('solo');
                setShowPlayerSetup(false);
                setPlayerCount(null);
                startNewGame();
              }} 
            />
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

function PlayerCountSelect({ onSelect, onCancel }: { onSelect: (n: number) => void, onCancel: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Choose number of players</h2>
        <div className="modal-buttons">
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => onSelect(n)}>{n}</button>
          ))}
        </div>
        <div className="modal-buttons">
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function PlayerNameInput({
  count,
  onStart,
  onCancel,
}: {
  count: number;
  onStart: (names: string[]) => void;
  onCancel: () => void;
}) {
  const [names, setNames] = useState(Array(count).fill(''));

  const handleSubmit = () => {
    const validNames = names.map(n => n.trim()).filter(Boolean);
    if (validNames.length === count) {
      onStart(validNames);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Enter Player Names</h2>
        {names.map((name, i) => (
          <input
            key={i}
            placeholder={`Player ${i + 1}`}
            value={name}
            onChange={(e) => {
              const copy = [...names];
              copy[i] = e.target.value;
              setNames(copy);
            }}
          />
        ))}
        <div className="modal-buttons">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={handleSubmit}>Start</button>
        </div>
      </div>
    </div>
  );
}
