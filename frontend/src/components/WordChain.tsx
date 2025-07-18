'use client';
import React from 'react';

interface Props {
  chain: string[];
}

export default function WordChain({ chain }: Props) {
  return <div className="chain-display">{chain.join(' → ')}</div>;
}