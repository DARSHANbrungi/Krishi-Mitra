# 🌿 KrishiMitra - Your Smart Farming Companion

![KrishiMitra Logo](public/logo512.png) 

**KrishiMitra is a modern, data-driven web application designed to empower Indian farmers with the tools and insights needed for smart, sustainable, and profitable agriculture.**

---

## ✨ Key Features

* **🌾 Field Management:** Create and manage multiple farm fields, tracking crop type, acreage, and sowing dates.
* **💰 Expense Tracking:** A detailed financial dashboard for each field to log and categorize expenses. Includes an interactive donut chart for visual expense breakdown.
* **☀️ Dynamic Weather Forecasts:** A beautiful, hyperlocal weather dashboard that uses geolocation. The entire UI theme dynamically changes to match the current weather and time of day.
* **🤖 Multilingual AI Assistant:** An integrated AI chatbot (powered by Google Gemini) that provides farming advice. It supports English, Hindi, and Kannada, and remembers the user's preference.
* **🌱 ML-Powered Crop Recommendation:** A Python-based Machine Learning model (Random Forest) that suggests the ideal crop to plant based on soil nutrient data and environmental conditions.
* **👤 User Profile Customization:** Farmers can personalize their experience by updating their display name and uploading a profile picture using Cloudinary for image hosting.
* **🎨 Customizable Theme:** A sleek user interface with a professional light/dark mode toggle.

## 🛠️ Tech Stack

* **Frontend:** React, Material-UI (MUI)
* **State Management:** React Hooks & Context API
* **Routing:** React Router
* **Backend (ML API):** Python, Flask, Pandas, Scikit-learn
* **Database & Auth:** Firebase (Firestore, Authentication)
* **File Storage:** Cloudinary
* **APIs:** Google Gemini (for AI Chat), OpenWeatherMap (for Weather)
* **Internationalization:** `react-i18next`

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your system:
* [Node.js](https://nodejs.org/) (which includes npm)
* [Python](https://www.python.org/downloads/) (version 3.8 or higher) and pip
* [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/DARSHANbrungi/Krishi-Mitra.git](https://github.com/DARSHANbrungi/Krishi-Mitra.git)
    cd Krishi-Mitra
    ```

2.  **Frontend Setup**
    Install all the necessary npm packages for the React application.
    ```bash
    npm install
    ```

3.  **Backend (Python ML) Setup**
    This will set up the environment for the Flask API server.
    ```bash
    # Navigate to the backend directory
    cd backend

    # (Recommended) Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install Python packages
    pip install Flask Flask-Cors pandas scikit-learn numpy
    ```

4.  **Firebase & External API Setup**
    You need to get API keys from a few services and provide them to the application.

    * **Create a `.env` file** in the **root** of the project. Copy the contents from the `.env.example` file below and fill in your keys.

    * **.env.example** (Copy this into your `.env` file)
        ```env
        # Firebase Configuration
        REACT_APP_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
        REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
        REACT_APP_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
        REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
        REACT_APP_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"

        # External APIs
        REACT_APP_OPENWEATHERMAP_API_KEY="YOUR_OPENWEATHERMAP_API_KEY"
        REACT_APP_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
        
        # Cloudinary
        REACT_APP_CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
        REACT_APP_CLOUDINARY_UPLOAD_PRESET="YOUR_CLOUDINARY_UPLOAD_PRESET"
        ```

5.  **Update Profile Page for `.env`**
    To keep all keys in one place, update `src/pages/ProfilePage.js` to read Cloudinary details from the `.env` file.
    * **Change these lines:**
        ```javascript
        const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
        const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";
        ```
    * **To this:**
        ```javascript
        const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
        const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
        ```

## ▶️ Running the Application

To run the full application, you need **two separate terminals** running at the same time.

### **Terminal 1: Start the Python ML Backend**
This server handles the crop recommendation requests.

```bash
# Navigate to the backend folder from the project root
cd backend

# (If you created a virtual environment, activate it first)
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Run the API server
python api.py
