import random
from transformers import AutoModel, AutoTokenizer
import torch

tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

# Basic list for now
WORD_LIST = ["tree", "car", "dog", "ocean", "fire", "light", "space", "river"]

def get_random_word_pair():
    return random.sample(WORD_LIST, 2)

def embed(text: str):
    tokens = tokenizer(text, return_tensors='pt', padding=True, truncation=True)
    with torch.no_grad():
        model_output = model(**tokens)
    return model_output.last_hidden_state.mean(dim=1)

def compute_similarity(word1: str, word2: str) -> float:
    emb1 = embed(word1)
    emb2 = embed(word2)
    cos_sim = torch.nn.functional.cosine_similarity(emb1, emb2)
    return cos_sim.item()

def get_next_ai_word(current_word: str, used_words: list[str]) -> str | None:
    used_words = [w.lower() for w in used_words]
    candidates = [word for word in WORD_LIST if word.lower() not in used_words and word.lower() != current_word.lower()]

    if not candidates:
        return None

    current_emb = embed(current_word)
    
    best_word = None
    best_score = -1.0

    for word in candidates:
        candidate_emb = embed(word)
        score = torch.nn.functional.cosine_similarity(current_emb, candidate_emb).item()
        if score > best_score and score > 0.3:
            best_score = score
            best_word = word

    return best_word
