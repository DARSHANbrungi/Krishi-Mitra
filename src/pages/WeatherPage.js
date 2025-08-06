// src/pages/WeatherPage.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Tooltip } from '@mui/material';
import axios from 'axios';
import { format, isSameDay } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// Icons
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import GrainIcon from '@mui/icons-material/Grain';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CompressIcon from '@mui/icons-material/Compress';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import ThermostatIcon from '@mui/icons-material/Thermostat';

const getWeatherIcon = (iconCode, theme) => {
    const iconStyle = { fontSize: { xs: 80, md: 100 }, mb: 1 };
    switch (iconCode.slice(0, 2)) {
        case '01': return <WbSunnyIcon sx={{ ...iconStyle, color: theme.palette.warning.main }} />;
        case '02': return <CloudQueueIcon sx={{ ...iconStyle, color: theme.palette.info.light }} />;
        case '03':
        case '04': return <CloudQueueIcon sx={{ ...iconStyle, color: theme.palette.text.secondary }} />;
        case '09':
        case '10': return <GrainIcon sx={{ ...iconStyle, color: theme.palette.info.main }} />;
        case '11': return <ThunderstormIcon sx={{ ...iconStyle, color: theme.palette.secondary.dark }} />;
        case '13': return <AcUnitIcon sx={{ ...iconStyle, color: theme.palette.info.light }} />;
        case '50': return <CloudQueueIcon sx={{ ...iconStyle, color: theme.palette.grey[400] }} />;
        default: return <CloudQueueIcon sx={{ ...iconStyle, color: theme.palette.text.secondary }} />;
    }
};

const getSmallWeatherIcon = (iconCode) => {
    const iconStyle = { fontSize: 48, my: 2 };
    switch (iconCode.slice(0, 2)) {
        case '01': return <WbSunnyIcon sx={{ ...iconStyle, color: 'warning.main' }} />;
        case '02': case '03': case '04': return <CloudQueueIcon sx={{ ...iconStyle, color: 'text.secondary' }} />;
        case '09': case '10': return <GrainIcon sx={{ ...iconStyle, color: 'info.main' }} />;
        default: return <CloudQueueIcon sx={{ ...iconStyle, color: 'text.secondary' }} />;
    }
};

const WeatherDetail = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={label}>
            {icon}
        </Tooltip>
        <Typography variant="body1" sx={{ ml: 1.5 }}>{value}</Typography>
    </Box>
);

const processForecastData = (list) => {
    const dailyData = {};
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = format(date, 'yyyy-MM-dd');
        if (!dailyData[dayKey]) {
            dailyData[dayKey] = { date: date, temps: [], icons: {}, descriptions: {} };
        }
        dailyData[dayKey].temps.push(item.main.temp);
        const icon = item.weather[0].icon;
        const desc = item.weather[0].main;
        dailyData[dayKey].icons[icon] = (dailyData[dayKey].icons[icon] || 0) + 1;
        dailyData[dayKey].descriptions[desc] = (dailyData[dayKey].descriptions[desc] || 0) + 1;
    });
    return Object.values(dailyData).map(day => {
        const mostCommonIcon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
        const mostCommonDesc = Object.keys(day.descriptions).reduce((a, b) => day.descriptions[a] > day.descriptions[b] ? a : b);
        return { date: day.date, temp_max: Math.round(Math.max(...day.temps)), temp_min: Math.round(Math.min(...day.temps)), icon: mostCommonIcon, description: mostCommonDesc };
    }).slice(0, 5);
};

const WeatherPage = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [currentWeather, setCurrentWeather] = useState(null);
    const [dailyForecast, setDailyForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locationName, setLocationName] = useState('');

    useEffect(() => {
        const fetchWeatherData = async (lat, lon) => {
            const API_KEY = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            try {
                const [currentResponse, forecastResponse] = await Promise.all([axios.get(currentWeatherUrl), axios.get(forecastUrl)]);
                setCurrentWeather(currentResponse.data);
                setLocationName(currentResponse.data.name);
                const processedDailyData = processForecastData(forecastResponse.data.list);
                setDailyForecast(processedDailyData);
            } catch (err) {
                console.error("Error fetching weather data:", err);
                setError('Could not fetch weather data.');
            } finally {
                setLoading(false);
            }
        };
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => fetchWeatherData(position.coords.latitude, position.coords.longitude),
            (err) => {
                setError("Could not get location. Please enable location services and refresh.");
                setLoading(false);
            }
        );
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 5 }}><CircularProgress /><Typography sx={{ ml: 2 }}>Getting your location...</Typography></Box>;
    }
    if (error || !currentWeather) {
        return <Alert severity="error">{error || 'Weather data could not be loaded.'}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>{t('weatherForecast')} - {locationName}</Typography>
            
            <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: '20px' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center' }}>
                        {getWeatherIcon(currentWeather.weather[0].icon, theme)}
                        <Box ml={3}>
                            <Typography variant="h2" fontWeight="500">{Math.round(currentWeather.main.temp)}°C</Typography>
                            <Typography variant="h6" color="text.secondary" textTransform="capitalize">{currentWeather.weather[0].description}</Typography>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={7}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={6} sm={4}><WeatherDetail icon={<ThermostatIcon color="action" />} label={t('feelsLike')} value={`${Math.round(currentWeather.main.feels_like)}°C`} /></Grid>
                            <Grid item xs={6} sm={4}><WeatherDetail icon={<WaterDropIcon color="info" />} label={t('humidity')} value={`${currentWeather.main.humidity}%`} /></Grid>
                            <Grid item xs={6} sm={4}><WeatherDetail icon={<AirIcon color="action" />} label={t('windSpeed')} value={`${currentWeather.wind.speed} m/s`} /></Grid>
                            <Grid item xs={6} sm={4}><WeatherDetail icon={<CompressIcon color="action" />} label={t('pressure')} value={`${currentWeather.main.pressure} hPa`} /></Grid>
                            <Grid item xs={6} sm={4}><WeatherDetail icon={<WbSunnyOutlinedIcon color="warning" />} label={t('sunrise')} value={format(new Date(currentWeather.sys.sunrise * 1000), 'p')} /></Grid>
                            <Grid item xs={6} sm={4}><WeatherDetail icon={<WbTwilightIcon color="secondary" />} label={t('sunset')} value={format(new Date(currentWeather.sys.sunset * 1000), 'p')} /></Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" sx={{mb: 2, fontWeight: '500'}}>{dailyForecast.length}-Day {t('forecastTitle')}</Typography>
            <Grid container spacing={2}>
                {dailyForecast.map((day, index) => {
                    const isToday = isSameDay(day.date, new Date());
                    return (
                        <Grid item xs={12} sm key={day.date.toISOString()} flexGrow={1}>
                             <Paper sx={{ p: 2, textAlign: 'center', height: '100%', borderRadius: '16px', border: isToday ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}` }}>
                                 <Typography variant="h6" fontWeight="500">{isToday ? t('today', 'Today') : format(day.date, 'EEE')}</Typography>
                                 {getSmallWeatherIcon(day.icon)}
                                 <Typography variant="body1" sx={{fontWeight: 'bold'}}>
                                    <Box component="span" color="error.main">{day.temp_max}°</Box> / <Box component="span" color="info.main">{day.temp_min}°</Box>
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary" textTransform="capitalize">{day.description}</Typography>
                             </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default WeatherPage;