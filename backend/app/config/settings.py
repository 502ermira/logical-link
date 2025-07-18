from transformers import AutoModel, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

WORD_LIST = ["tree", "car", "dog", "ocean", "fire", "light", "space", "river"]