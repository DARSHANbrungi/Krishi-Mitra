// src/App.js
import React, { useState, useEffect, useContext, createContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Typography } from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Pages and Layouts
import WelcomePage from './welcome/WelcomePage';
import AuthPage from './auth/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layout/AppLayout'; // <-- We will rename FieldLayout back to AppLayout
import FieldListPage from './pages/FieldListPage';
import CreateFieldPage from './pages/CreateFieldPage';
import FieldDetailPage from './pages/FieldDetailPage'; // <-- We will rename MoistureDashboard to this
import WeatherPage from './pages/WeatherPage';
import CropRecommenderPage from './pages/CropRecommenderPage';

// THEME (remains the same)
const theme = createTheme({
    palette: { primary: { main: '#2e7d32' }, secondary: { main: '#ff8f00' }, background: { default: '#f4f6f8', paper: '#ffffff', farm: '#f1f8e9' }},
    typography: { fontFamily: 'Roboto, sans-serif', h1: { fontFamily: 'Merriweather, serif' }, h2: { fontFamily: 'Merriweather, serif' }, h3: { fontFamily: 'Merriweather, serif' }, h4: { fontFamily: 'Merriweather, serif' }, h5: { fontFamily: 'Merriweather, serif' }, h6: { fontFamily: 'Merriweather, serif' }},
});

// Auth Context (remains the same)
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => setShowAuthPage(true);

  if (loading) {
    return <Typography sx={{ textAlign: 'center', mt: '20%' }} variant="h5">Loading KrishiMitra...</Typography>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ user, loading }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? (showAuthPage ? <Navigate to="/auth" /> : <WelcomePage onGetStarted={handleGetStarted} />) : <Navigate to="/app" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/app" />} />

          {/* Protected Application Routes */}
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="my-fields" replace />} />
            <Route path="my-fields" element={<FieldListPage />} />
            <Route path="my-fields/:fieldId" element={<FieldDetailPage />} />
            <Route path="create-field" element={<CreateFieldPage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="recommend" element={<CropRecommenderPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={user ? "/app" : "/"} />} />
        </Routes>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;