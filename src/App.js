// src/App.js
import React,{ useState, useEffect, useContext, createContext, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import ProfilePage from './pages/ProfilePage';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// We create a new component for the routes to get access to the `useNavigate` hook
function AppRoutes() {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/app'); // If user is logged in, go to the main app
    } else {
      navigate('/auth'); // If user is not logged in, go to the login/signup page
    }
  };

  return (
    <Routes>
      {/* The Welcome Page is now the strict entry point for everyone */}
      <Route path="/" element={<WelcomePage onGetStarted={handleGetStarted} />} />
      
      {/* Auth page redirects if the user is already logged in */}
      <Route path="/auth" element={user ? <Navigate to="/app" /> : <AuthPage />} />
      
      {/* Protected Application Routes */}
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="my-fields" replace />} />
        <Route path="my-fields" element={<FieldListPage />} />
        <Route path="my-fields/:fieldId" element={<FieldDetailPage />} />
        <Route path="create-field" element={<CreateFieldPage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="recommend" element={<CropRecommenderPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback route now always redirects to the Welcome Page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
                primary: { main: '#2e7d32' },
                secondary: { main: '#ff8f00' },
                background: { default: '#f4f6f8', paper: '#ffffff', farm: '#f1f8e9' },
              }
            : {
                primary: { main: '#66bb6a' },
                secondary: { main: '#ffa726' },
                background: { default: '#1C2531', paper: '#253241', farm: '#1C2531' },
                text: { primary: '#E0E0E0', secondary: '#A0A0A0' },
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

  useEffect(() => {
    if (!user) {
      setMode('light');
    }
  }, [user]);

  if (loading) {
    return <Typography sx={{ textAlign: 'center', mt: '20%' }} variant="h5">Loading KrishiMitra...</Typography>;
  }

  return (
    <AppContext.Provider value={{ user, colorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </AppContext.Provider>
  );
}

export default App;