# backend/ml/train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load the dataset
df = pd.read_csv('Crop_recommendation.csv')

# Features and Target
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

# Splitting the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Creating a RandomForestClassifier
model = RandomForestClassifier(n_estimators=20, random_state=0)
model.fit(X_train, y_train)

# Save the trained model to a file
with open('model.pkl', 'wb') as file:
    pickle.dump(model, file)

print("Model trained and saved successfully as model.pkl")