// src/Dashboard.js
import React from 'react';
import { Container, Grid, Paper, Typography, Box, Button } from '@mui/material'; // Add Button
import MoistureChart from './components/MoistureChart';
import OpacityIcon from '@mui/icons-material/Opacity';
import { auth } from './firebase'; // Import auth
import { signOut } from 'firebase/auth'; // Import signOut

// Accept a prop to get the user's name
const Dashboard = ({ user }) => {

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            KrishiMitra Dashboard 🌱
          </Typography>
          <Box>
            {/* Display user's name if available */}
            <Typography variant="body1" component="span" sx={{ mr: 2 }}>
              Welcome, {user?.displayName || 'Farmer'}!
            </Typography>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{ p: 2, display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: '12px' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <OpacityIcon sx={{ color: '#1976d2', mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Real-time Soil Moisture
                </Typography>
              </Box>
              <MoistureChart />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;