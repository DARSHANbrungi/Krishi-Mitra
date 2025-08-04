// functions/index.js
const functions = require("firebase-functions");
const axios = require("axios");

// This is a secure way to store your API key
const API_KEY = functions.config().openweather.key;


exports.getWeatherForecast = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    // UPDATED: This block was reformatted to fix the 'max-len' error.
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  const lat = data.lat;
  const lon = data.lon;

  if (!lat || !lon) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with two arguments, 'lat' and 'lon'.",
    );
  }

  // OpenWeatherMap One Call API 3.0 URL
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error.response.data);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to fetch weather data.",
    );
  }
});


