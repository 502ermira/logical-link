from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.utils import get_random_word_pair, compute_similarity

app = FastAPI()

class WordRequest(BaseModel):
    current_word: str
    next_word: str

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
