import faiss
import json
import os
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

# Set your Gemini API key
os.environ["GOOGLE_API_KEY"] = "API-kley"

# Load example data
with open("data/example_data.json", "r") as f:
    user_data = json.load(f)

# Initialize FAISS with Google Gemini embeddings
embedding_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# Prepare data for FAISS
texts = [json.dumps(user) for user in user_data]

# Store FAISS index
vector_store = FAISS.from_texts(texts, embedding_model)

# Save FAISS index only (without embeddings model)
faiss_index_path = "data/faiss_index"
vector_store.save_local(faiss_index_path)

print("✅ FAISS index saved successfully.")
