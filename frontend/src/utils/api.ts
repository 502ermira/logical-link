export async function fetchStartWords() {
  const res = await fetch('http://localhost:8000/start-words');
  if (!res.ok) throw new Error('Failed to fetch');
  return await res.json();
}

export async function validateWord(current_word: string, next_word: string) {
  const res = await fetch('http://localhost:8000/validate-word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_word, next_word }),
  });
  if (!res.ok) throw new Error('Validation failed');
  return await res.json();
}

export async function fetchNextAIWord(current_word: string, used_words: string[]) {
  const res = await fetch('http://localhost:8000/ai-next-word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_word, used_words }),
  });
  if (!res.ok) throw new Error('AI word fetch failed');
  return await res.json();
}