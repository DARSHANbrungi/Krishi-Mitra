// backend/sensorSimulator.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../serviceAccountKey.json'); 

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const collectionName = 'moistureReadings';

// --- UPDATED ---
// A single, global ID that the simulator will always use.
const GLOBAL_TEST_FIELD_ID = "global-test-field-01"; 

console.log(`Virtual Sensor starting. Sending all data to the global ID: ${GLOBAL_TEST_FIELD_ID}`);

function getMoistureValue() {
  return Math.floor(Math.random() * (65 - 35 + 1) + 35);
}

async function addReading() {
  const newReading = {
    value: getMoistureValue(),
    timestamp: new Date(),
    fieldId: GLOBAL_TEST_FIELD_ID, // <-- Always uses the global ID
  };

  try {
    await db.collection(collectionName).add(newReading);
    console.log(`[${new Date().toLocaleTimeString()}] Sent reading for global test field: ${newReading.value}%.`);
  } catch (error) {
    console.error("Error sending reading to Firestore:", error);
  }
}

// Cleanup function remains the same
async function cleanupOldReadings() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oldReadingsQuery = db.collection(collectionName).where('timestamp', '<', oneHourAgo);
    
    try {
        const snapshot = await oldReadingsQuery.get();
        if (snapshot.empty) return;
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`Cleaned up ${snapshot.size} old documents.`);
    } catch (error) {
        console.error("Error cleaning up old documents:", error);
    }
}

setInterval(addReading, 5000);
setInterval(cleanupOldReadings, 10 * 60 * 1000);