import os
import faiss
import json
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from flask import Flask, request, jsonify
from classify_questions import classify_question

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
    The user has been diagnosed or has been not diagnosed with heart disease based on the classification. Here are the factors influencing this prediction:

    **Contributing Factors:**
    {'\n'.join(positive_features) if positive_features else 'None'}

    **Factors Acting Against the Prediction:**
    {'\n'.join(negative_features) if negative_features else 'None'}

    Explain why these factors impact {disease} in simple terms.
    """
    print(prompt)
    response = llm.invoke(prompt) 
    
    return response.content


def query():
    try:
        print("Here inside main")
        data = request.get_json()
        user_id = data['user_id']
        if user_id is None:
            return jsonify({'error': 'user_id is required'}), 400

        conversation = data['conversation']
        if conversation is None:
            return jsonify({'error': 'question is required'}), 400
        
        system_message = {
            "role": "system",
            "content": (
                "You are a highly skilled health advisor. You have expertise in explaining "
                "health concepts clearly and concisely. Your role is to assist the user based "
                "on the context of the previous messages. Always make sure your responses are "
                "accurate, helpful, and based on the context of the conversation. "
                "Respond to the last user message considering the context provided above."
            )
        }
        messages = [system_message] + [{"role": message['role'], "content": message['content']} for message in conversation]

        #fetch the last question from the conversation
        question = messages[-1]['content']

        classification = classify_question(question).strip().lower()
        print("Classification : ", classification)

        if classification == "personal health question":
            # response = personal_budgeting(user_id, question)
            print("In Personal health")
            response = generate_medical_explanation(user_id, question)
        elif classification == "General health question not related to person's data":
            print("General health question not related to person's data")
            response = general_prompt(user_id, messages)
        else:
            print("In other")
            response = general_prompt(user_id, messages)

        if response['status_code'] == 200:
            return jsonify({'message': 'Successful', 'response': response['message']}), 200
        else:
            return jsonify({'error': 'Failure'}), 500

    except Exception as e:
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500



def general_prompt(user_id, question):
    try:
        prompt = f"{question}"
        print("Setting up a model")
        print("Question : ", prompt)
        model = llm
        response = model.generate_content(prompt)

        if response and response.text:
            generated_text = response.text
            return {'question': question, 'message': generated_text, 'status_code': 200}
        else:
            return {'error': 'No response from the model', 'status_code': 500}

    except Exception as e:
        return {'error': f"An error occurred: {str(e)}", 'status_code': 500}
    



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
