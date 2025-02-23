import pickle

FAISS_INDEX_PATH = "data/faiss_index/index.pkl"

with open(FAISS_INDEX_PATH, "rb") as f:
    faiss_index = pickle.load(f)

print(faiss_index)  # Check if it contains any stored embeddings
