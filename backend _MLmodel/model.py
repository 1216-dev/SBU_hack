import json
import joblib
import lime
from lime import lime_tabular
import pandas as pd
import numpy as np
import re

loaded_model = joblib.load("logistic_regression_model.pkl")

with open('unseen_data.json', 'r') as f:  # Replace with the actual file name
    unseen_data = json.load(f)

X_unseen = pd.DataFrame([unseen_data]) 

if 'target' in X_unseen.columns:
    X_unseen = X_unseen.drop(columns=['target'])

y_pred = loaded_model.predict(X_unseen)
print("Predicted Class:", y_pred[0])

# Load LIME parameters
with open("lime_explainer_params.json", "r") as f:
    loaded_params = json.load(f)
# Load training data for LIME
X_train_loaded = np.load("lime_training_data.npy")

explainer_lime_reconstructed = lime.lime_tabular.LimeTabularExplainer(
    X_train_loaded,
    mode=loaded_params["mode"],
    class_names=loaded_params["class_names"],
    feature_names=loaded_params["feature_names"],
    categorical_features=loaded_params["categorical_features"],
    categorical_names=loaded_params["categorical_names"]
)

# Convert sample instance into numpy array
sample_instance = np.array(X_unseen.iloc[0])
# Generate explanation
exp = explainer_lime_reconstructed.explain_instance(sample_instance, loaded_model.predict_proba)

# # Display explanation
# exp.show_in_notebook()


# Mapping of feature names to their descriptions
feature_mapping = {
    "age": "Patients Age in years",
    "sex": "Gender (Male : 1; Female : 0)",
    "cp": "Type of chest pain experienced",
    "trestbps": "Patient's blood pressure at rest (mm/HG)",
    "chol": "Serum cholesterol in mg/dl",
    "fbs": "Fasting blood sugar > 120 mg/dl (1 = True, 0 = False)",
    "restecg": "Resting electrocardiogram results",
    "thalach": "Maximum heart rate achieved",
    "exang": "Exercise-induced angina (1 = Yes, 0 = No)",
    "oldpeak": "Exercise-induced ST depression",
    "slope": "Slope of the ST segment during exercise",
    "ca": "Number of major vessels (0-3)",
    "thal": "Thalassemia blood disorder type",
}

# Convert LIME result to dictionary
lime_dict = {feature_mapping.get(f, f): score for f, score in exp.as_list()}


# Function to clean feature names by removing '=value' and extract the value separately
def clean_feature_name(feature):
    match = re.search(r"=(\d+(\.\d+)?)", feature)  # Extracts the value after '='
    value = match.group(1) if match else None
    name = re.sub(r"=\d+(\.\d+)?", "", feature)  # Removes numbers after '='
    return name, value

# Convert LIME result to dictionary with cleaned feature names and values
lime_dict = {}
for feature, score in exp.as_list()[:5]:  # Taking first 5 features
    clean_name, value = clean_feature_name(feature)
    mapped_name = feature_mapping.get(clean_name, clean_name)
    lime_dict[mapped_name] = [int(value), score]

# Print the result
print(json.dumps(lime_dict, indent=4))
