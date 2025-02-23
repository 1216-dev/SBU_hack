import os
import faiss
import json
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI


# Load API Key from environment variable
GOOGLE_API_KEY = "API-key"
if not GOOGLE_API_KEY:
    raise ValueError("⚠️ GOOGLE_API_KEY is missing. Set it in your environment variables.")

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY)

# Paths
FAISS_INDEX_PATH = "data/faiss_index/index.faiss"
EXAMPLE_DATA_PATH = "data/faiss_index/example_data.json"


# Load FAISS Index
def load_faiss_index(index_path=FAISS_INDEX_PATH):
    if not os.path.exists(index_path):
        raise FileNotFoundError(f"⚠️ FAISS index file not found: {index_path}")

    try:
        faiss_index = faiss.read_index(index_path)
        if not isinstance(faiss_index, faiss.Index):
            raise ValueError("⚠️ Loaded FAISS object is not valid.")
        return faiss_index
    except Exception as e:
        print(f"⚠️ Error loading FAISS index: {e}")
        return None


# Retrieve user data
def retrieve_user_data(vector_db, user_query, fallback_data_path=EXAMPLE_DATA_PATH):
    if vector_db:
        try:
            user_vector = [0] * vector_db.d  # Dummy vector for searching
            distances, indices = vector_db.search(user_vector, k=1)

            if indices[0][0] != -1:
                with open(fallback_data_path, "r", encoding="utf-8") as f:
                    return json.load(f)  # Load example data
        except AttributeError:
            print("⚠️ FAISS object not properly initialized. Using fallback data.")

    with open(fallback_data_path, "r", encoding="utf-8") as f:
        return json.load(f)


# Generate medical explanation
def generate_medical_explanation(llm, user_data):
    features = user_data.get("top_5_features", {})
    disease = user_data.get("disease", "the condition")

    positive_features = []
    negative_features = []

    for feature, (value, lime_prob) in features.items():
        explanation = f"- {feature}: Value = {value}, LIME Impact = {lime_prob:.2f}"
        if lime_prob >= 0:
            positive_features.append(explanation)
        else:
            negative_features.append(explanation)

    prompt = f"""
    The user has been diagnosed with {disease}. Here are the factors influencing this prediction:

    **Contributing Factors:**
    {'\n'.join(positive_features) if positive_features else 'None'}

    **Factors Acting Against the Prediction:**
    {'\n'.join(negative_features) if negative_features else 'None'}

    Explain why these factors impact {disease} in simple terms.
    """
    print(prompt)
    response = llm.invoke(prompt)  # ✅ FIXED: Passing string instead of HumanMessage
    
    return response.content



# General chatbot response
def general_chat(llm, user_input):
    response = llm.invoke(user_input)  # ✅ FIXED: Passing string instead of HumanMessage
    return response


# Main function
def main(user_query, use_fallback=False):
    vector_db = load_faiss_index()

    try:
        user_data = retrieve_user_data(vector_db, user_query)
    except Exception as e:
        print(f"⚠️ Error retrieving data from FAISS: {e}")
        user_data = None

    if use_fallback or user_data is None:
        print("⚠️ No match found in FAISS. Using fallback data.")
        with open(EXAMPLE_DATA_PATH, "r") as f:
            user_data = json.load(f)

    if "top_5_features" in user_data:
        return generate_medical_explanation(llm, user_data)
    else:
        return general_chat(llm, user_query)


# Run the script
if __name__ == "__main__":
    user_query = "12345"  # Use user_id from example_data.json
    print(main(user_query, use_fallback=True))
