// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBublDSOM5Xjca_4nY0gIcbQ4mn1GG45C4",
  authDomain: "krishimitra-project.firebaseapp.com",
  projectId: "krishimitra-project",
  storageBucket: "krishimitra-project.firebasestorage.app",
  messagingSenderId: "509816957536",
  appId: "1:509816957536:web:425aa3f87d7dc5d0ea3105",
  measurementId: "G-ZYC31W0QFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);

export { db,auth };