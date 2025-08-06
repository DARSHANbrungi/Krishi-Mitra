# backend/api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

# Load the crop recommendation model
try:
    with open('models/crop_recommender/model.pkl', 'rb') as file:
        crop_model = pickle.load(file)
except FileNotFoundError:
    print("Crop model not found. Please train it first.")
    crop_model = None

@app.route('/predict/crop', methods=['POST'])
def predict_crop():
    if crop_model is None:
        return jsonify({'error': 'Crop model is not loaded.'}), 500

    data = request.get_json()
    features = [
        data['N'], data['P'], data['K'],
        data['temperature'], data['humidity'], data['ph'], data['rainfall']
    ]
    final_features = [np.array(features)]
    prediction = crop_model.predict(final_features)
    
    return jsonify({'recommendation': prediction[0]})

# You will add a new @app.route('/predict/fertilizer') here in the future

if __name__ == '__main__':
    app.run(debug=True, port=5001)