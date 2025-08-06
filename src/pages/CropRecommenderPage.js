// src/pages/CropRecommenderPage.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, CircularProgress, Alert, Chip, Divider, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { keyframes } from '@mui/system';

// Icons
import GrassIcon from '@mui/icons-material/Grass';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'; // For pH
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import GrainIcon from '@mui/icons-material/Grain';
import Filter1Icon from '@mui/icons-material/Filter1'; // For N
import Filter2Icon from '@mui/icons-material/Filter2'; // For P
import Filter3Icon from '@mui/icons-material/Filter3'; // For K

const fadeInUp = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

const CropRecommenderPage = () => {
    const { t } = useTranslation();
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [formValues, setFormValues] = useState({
        N: '90',
        P: '42',
        K: '43',
        temperature: '',
        humidity: '',
        ph: '6.5',
        rainfall: '202'
    });
    const [recommendation, setRecommendation] = useState('');
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const API_KEY = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                try {
                    const response = await axios.get(url);
                    setWeather(response.data);
                    setFormValues(prev => ({
                        ...prev,
                        temperature: response.data.main.temp.toFixed(2),
                        humidity: response.data.main.humidity.toFixed(2)
                    }));
                } catch (err) {
                    console.error("Failed to fetch weather for auto-fill");
                } finally {
                    setLoadingWeather(false);
                }
            }, () => { setLoadingWeather(false); });
        } else { setLoadingWeather(false); }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingRecommendation(true);
        setRecommendation('');
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:5001/predict/crop', {
                N: Number(formValues.N),
                P: Number(formValues.P),
                K: Number(formValues.K),
                temperature: Number(formValues.temperature),
                humidity: Number(formValues.humidity),
                ph: Number(formValues.ph),
                rainfall: Number(formValues.rainfall)
            });
            setRecommendation(response.data.recommendation);
        } catch (err) {
            setError('Could not connect to the recommendation server. Please ensure the Python backend is running.');
            console.error(err);
        } finally {
            setLoadingRecommendation(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>{t('cropRecommender')}</Typography>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px' }}>
                <Typography variant="h6" gutterBottom>{t('enterConditions', 'Enter Soil and Environmental Conditions')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Provide details about your field to get an AI-powered crop recommendation. Temperature and humidity are auto-filled from your local weather.
                </Typography>

                <Divider sx={{ my: 3 }}><Chip label="Soil Nutrients" /></Divider>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}><TextField name="N" label={t('nitrogenRatio')} value={formValues.N} onChange={handleInputChange} fullWidth required type="number" InputProps={{ startAdornment: <InputAdornment position="start"><Filter1Icon color="action" /></InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="P" label={t('phosphorusRatio')} value={formValues.P} onChange={handleInputChange} fullWidth required type="number" InputProps={{ startAdornment: <InputAdornment position="start"><Filter2Icon color="action" /></InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="K" label={t('potassiumRatio')} value={formValues.K} onChange={handleInputChange} fullWidth required type="number" InputProps={{ startAdornment: <InputAdornment position="start"><Filter3Icon color="action" /></InputAdornment> }} /></Grid>
                </Grid>

                <Divider sx={{ my: 3 }}><Chip label="Environmental Factors" /></Divider>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}><TextField name="temperature" label={`${t('temperature')} (°C)`} value={formValues.temperature} onChange={handleInputChange} fullWidth required type="number" helperText={loadingWeather ? t('loadingWeather') : t('autofilled')} InputProps={{ startAdornment: <InputAdornment position="start"><ThermostatIcon color="action" /></InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField name="humidity" label={`${t('humidity')} (%)`} value={formValues.humidity} onChange={handleInputChange} fullWidth required type="number" helperText={loadingWeather ? t('loadingWeather') : t('autofilled')} InputProps={{ startAdornment: <InputAdornment position="start"><WaterDropOutlinedIcon color="action" /></InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField name="ph" label={t('phValue')} value={formValues.ph} onChange={handleInputChange} fullWidth required type="number" InputProps={{ startAdornment: <InputAdornment position="start"><ScienceOutlinedIcon color="action" /></InputAdornment> }} /></Grid>
                    <Grid item xs={12}><TextField name="rainfall" label={`${t('rainfall')} (mm)`} value={formValues.rainfall} onChange={handleInputChange} fullWidth required type="number" InputProps={{ startAdornment: <InputAdornment position="start"><GrainIcon color="action" /></InputAdornment> }} /></Grid>
                </Grid>
                
                <Box textAlign="center">
                    <Button type="submit" variant="contained" size="large" sx={{ mt: 4, px: 5, py: 1.5, borderRadius: '28px' }} disabled={loadingRecommendation}>
                        {loadingRecommendation ? <CircularProgress size={24} color="inherit" /> : t('recommendCrop')}
                    </Button>
                </Box>
                
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
                
                {recommendation && (
                    <Paper
                        elevation={4}
                        sx={{
                            mt: 4,
                            p: 3,
                            borderRadius: '16px',
                            textAlign: 'center',
                            animation: `${fadeInUp} 0.5s ease-out`,
                            background: (theme) => theme.palette.mode === 'light' ? `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.primary.light} 100%)` : `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white'
                        }}
                    >
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>{t('idealCropIs')}</Typography>
                        <Chip
                            icon={<GrassIcon />}
                            label={recommendation}
                            sx={{
                                fontSize: '1.5rem',
                                p: 3,
                                mt: 1,
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)',
                                '.MuiChip-icon': {
                                    color: 'white'
                                }
                            }}
                        />
                    </Paper>
                )}
            </Paper>
        </Box>
    );
};

export default CropRecommenderPage;