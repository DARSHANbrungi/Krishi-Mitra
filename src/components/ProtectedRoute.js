// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App'; // We will create this hook next in App.js

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // If user is not logged in, redirect them to the welcome page
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;