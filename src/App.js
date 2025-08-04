// src/App.js
import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Typography } from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Pages and Layouts
import WelcomePage from './welcome/WelcomePage';
import AuthPage from './auth/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import CreateFieldPage from './pages/CreateFieldPage';
import FieldListPage from './pages/FieldListPage';
import FieldDetailPage from './pages/FieldDetailPage';
import WeatherPage from './pages/WeatherPage';
import CropRecommenderPage from './pages/CropRecommenderPage';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light Mode Palette (Unchanged)
                primary: { main: '#2e7d32' },
                secondary: { main: '#ff8f00' },
                background: {
                    default: '#f4f6f8',
                    paper: '#ffffff',
                    farm: '#f1f8e9'
                },
              }
            : {
                // --- UPDATED: Professional Dark Mode Palette ---
                primary: { main: '#66bb6a' },
                secondary: { main: '#ffa726' },
                background: {
                    default: '#1C2531', // Deep, dark blue-slate
                    paper: '#253241',   // A slightly lighter slate for elevated surfaces
                    farm: '#1C2531'    // Use the default dark for the main bg
                },
                text: {
                    primary: '#E0E0E0',
                    secondary: '#A0A0A0',
                },
              }),
        },
        typography: {
            fontFamily: 'Roboto, sans-serif',
            h1: { fontFamily: 'Merriweather, serif' },
            h2: { fontFamily: 'Merriweather, serif' },
            h3: { fontFamily: 'Merriweather, serif' },
            h4: { fontFamily: 'Merriweather, serif' },
            h5: { fontFamily: 'Merriweather, serif' },
            h6: { fontFamily: 'Merriweather, serif' },
        },
      }),
    [mode],
  );

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
    <AppContext.Provider value={{ user, colorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={!user ? (showAuthPage ? <Navigate to="/auth" /> : <WelcomePage onGetStarted={handleGetStarted} />) : <Navigate to="/app" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/app" />} />
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="my-fields" replace />} />
            <Route path="my-fields" element={<FieldListPage />} />
            <Route path="my-fields/:fieldId" element={<FieldDetailPage />} />
            <Route path="create-field" element={<CreateFieldPage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="recommend" element={<CropRecommenderPage />} />
          </Route>
          <Route path="*" element={<Navigate to={user ? "/app" : "/"} />} />
        </Routes>
      </ThemeProvider>
    </AppContext.Provider>
  );
}

export default App;