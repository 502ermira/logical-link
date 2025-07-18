from fastapi import APIRouter
from app.models.schemas import WordRequest, AIWordRequest
from app.services.word_logic import get_random_word_pair, compute_similarity, get_next_ai_word

router = APIRouter()

@router.get("/start-words")
def start_words():
    start, target = get_random_word_pair()
    return {"start_word": start, "target_word": target}

@router.post("/validate-word")
def validate_word(request: WordRequest):
    if request.current_word.lower() == request.next_word.lower():
        return {"valid": False, "score": 1.0, "reason": "Same word"}
    
    score = compute_similarity(request.current_word, request.next_word)
    return {"valid": score > 0.3, "score": score}

@router.post("/ai-next-word")
def ai_next_word(request: AIWordRequest):
    ai_word = get_next_ai_word(request.current_word, request.used_words)
    if ai_word:
        return {"ai_word": ai_word}
    return {"error": "No suitable next word found"}