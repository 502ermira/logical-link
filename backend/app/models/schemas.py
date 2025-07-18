from pydantic import BaseModel

class WordRequest(BaseModel):
    current_word: str
    next_word: str

class AIWordRequest(BaseModel):
    current_word: str
    used_words: list[str]