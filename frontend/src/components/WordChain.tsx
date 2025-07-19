'use client';
import React from 'react';

type Props = {
  chain: { word: string, playerIndex: number | null }[];
  playerColors: string[];
  players: string[];
};

export default function WordChain({ chain, playerColors, players }: Props) {
  return (
    <div className="mb-4">
      {chain.map((entry, idx) => {
        const color = entry.playerIndex !== null ? playerColors[entry.playerIndex % playerColors.length] : '';
        const label = entry.playerIndex !== null ? ` (${players[entry.playerIndex]})` : '';
        return (
          <div key={idx} className={`py-1 ${color}`}>
            {entry.word}{label}
          </div>
        );
      })}
    </div>
  );
}