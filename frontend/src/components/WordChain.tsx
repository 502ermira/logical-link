'use client';
import React from 'react';

type Props = {
  chain: { word: string; playerIndex: number | null }[];
  playerColors: string[];
  players: string[];
};

export default function WordChain({ chain, playerColors, players }: Props) {
  return (
    <div className="chain-display">
      {chain.map((entry, idx) => {
        const playerColorClass =
          entry.playerIndex !== null
            ? `player-color-${entry.playerIndex % playerColors.length}`
            : '';

        const label =
          entry.playerIndex !== null ? ` (${players[entry.playerIndex]})` : '';

        return (
          <div key={idx} className={`chain-word ${playerColorClass}`}>
            {entry.word}
            {label}
          </div>
        );
      })}
    </div>
  );
}
