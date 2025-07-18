from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.utils import get_random_word_pair, compute_similarity, get_next_ai_word

app = FastAPI()

class WordRequest(BaseModel):
    current_word: str
    next_word: str

class CurrentWordRequest(BaseModel):
    current_word: str

class AIWordRequest(BaseModel):
    current_word: str
    used_words: list[str]

@app.get("/start-words")
def start_words():
    start, target = get_random_word_pair()
    return {"start_word": start, "target_word": target}

@app.post("/validate-word")
def validate_word(request: WordRequest):
    if request.current_word.lower() == request.next_word.lower():
        return {"valid": False, "score": 1.0, "reason": "Same word"}

    score = compute_similarity(request.current_word, request.next_word)
    return {"valid": score > 0.3, "score": score}

@app.post("/ai-next-word")
def ai_next_word(request: AIWordRequest):
    ai_word = get_next_ai_word(request.current_word, request.used_words)
    if ai_word:
        return {"ai_word": ai_word}
    return {"error": "No suitable next word found"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
