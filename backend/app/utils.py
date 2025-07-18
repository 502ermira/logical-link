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