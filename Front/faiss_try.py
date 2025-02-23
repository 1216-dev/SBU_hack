from langchain_google_genai import GoogleGenerativeAIEmbeddings
import json
import os
import numpy as np
import faiss

# Set up Google API key
os.environ["GOOGLE_API_KEY"] = ""

# Sample data
sample_data = [
    {
        "user_id": "12345",
        "disease": "Diabetes",
        "top_5_features": {
            "High blood sugar": [180, 0.8],
            "Insulin resistance": [75, 0.7],
            "Obesity": [30, 0.6],
            "Family history": [1, 0.5],
            "Sedentary lifestyle": [8, 0.4]
        }
    }
]

def create_data_files():
    # Create directories if they don't exist
    os.makedirs("data/faiss_index", exist_ok=True)
    
    # Save example data as JSON
    json_path = "data/faiss_index/example_data.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(sample_data[0], f, indent=4)
    print(f"✅ JSON file created at: {json_path}")

    # Create embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    # Get embeddings for the texts
    texts = [data["user_id"] for data in sample_data]
    print("Generating embeddings...")
    embedding_vectors = [embeddings.embed_query(text) for text in texts]
    
    # Convert to numpy array
    embedding_vectors = np.array(embedding_vectors).astype('float32')
    
    # Create FAISS index
    dimension = len(embedding_vectors[0])  # Get dimension from the first embedding
    index = faiss.IndexFlatL2(dimension)
    index.add(embedding_vectors)
    
    # Save the FAISS index
    faiss_path = "data/faiss_index/index.faiss"
    faiss.write_index(index, faiss_path)
    print(f"✅ FAISS index saved at: {faiss_path}")
    
    # Save metadata separately
    metadata_path = "data/faiss_index/metadata.json"
    metadata = {
        "texts": texts,
        "metadatas": [{"data": json.dumps(data)} for data in sample_data]
    }
    with open(metadata_path, "w") as f:
        json.dump(metadata, f)
    print(f"✅ Metadata saved at: {metadata_path}")
    
    # Verify the index
    try:
        loaded_index = faiss.read_index(faiss_path)
        print(f"✅ Verification successful - index loaded with {loaded_index.ntotal} vectors")
    except Exception as e:
        print(f"⚠️ Verification failed: {e}")

if __name__ == "__main__":
    create_data_files()