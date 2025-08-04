// src/auth/AuthPage.js
import React, { useState } from 'react';
import { Box, Paper, Typography, Link } from '@mui/material';
import Login from './Login';
import Signup from './Signup';
import farmBackground from '../assets/farm-background.jpg'; // Import the image

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `url(${farmBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
          backdropFilter: 'blur(4px)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          KrishiMitra 🌱
        </Typography>
        {isLogin ? <Login /> : <Signup />}
        <Typography align="center" sx={{ mt: 2 }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <Link href="#" onClick={toggleForm} sx={{ ml: 1 }}>
            {isLogin ? 'Sign Up' : 'Login'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthPage;
