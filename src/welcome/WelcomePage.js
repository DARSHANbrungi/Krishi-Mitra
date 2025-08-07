// src/welcome/WelcomePage.js

import React, { useRef } from 'react';
import { Box, Button, Container, Typography, Grid, Card, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText, Chip } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import { keyframes } from '@mui/system';
import Slider from 'react-slick';

// Import slick-carousel styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Icons
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CloudIcon from '@mui/icons-material/Cloud';
import RecommendIcon from '@mui/icons-material/Recommend';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// --- Static Content Arrays ---
const features = [
  { icon: <TrackChangesIcon />, title: "Track Your Crops", description: "Log and monitor your crop lifecycle from sowing to harvesting. Keep records of expenses, yields, and profits effortlessly." },
  { icon: <WaterDropIcon />, title: "Smart Irrigation System", description: "Automate your irrigation using real-time weather data and soil moisture insights — save water, save energy.", status: "Coming Soon" },
  { icon: <CloudIcon />, title: "Weather Forecasts", description: "Stay informed with accurate local weather predictions to plan your farming activities better." },
  { icon: <RecommendIcon />, title: "Crop Recommendations", description: "Get personalized suggestions based on soil conditions, climate, and current market trends." },
  { icon: <SmartToyIcon />, title: "AI-Powered Farming Assistant", description: "Chat with our built-in AI chatbot to ask questions about farming, fertilizers, government schemes, or common crop issues." },
  { icon: <StorefrontIcon />, title: "Fertilizer & Equipment Store", description: "Access trusted suppliers for seeds, fertilizers, pesticides, and farming tools right from your mobile or desktop." },
];

const whyPoints = [
  "Farmer-friendly design",
  "Offline-first capabilities (coming soon)",
  "Built with scalable & secure cloud backend (Firebase)",
  "Helps reduce waste and maximize output",
  "Supports local languages"
];

const carouselImages = [
    'https://wallpapercave.com/wp/wp9212011.jpg', // Field
    'https://wallpaperaccess.com/full/1598224.jpg', // Tractor
    'https://www.deere.com.au/assets/images/region-4/products/harvesting/tseries-combine-r2C001197-1920x1080.jpg', // Harvest
];


// --- Styled Components & Animation ---
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.primary.dark,
}));

const HeroSlide = styled(Box)({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  textAlign: 'center',
  padding: '24px'
});

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

// --- The WelcomePage Component ---
const WelcomePage = ({ onGetStarted }) => {
  const theme = useTheme();
  const featuresRef = useRef(null);

  const handleScrollDown = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.farm, overflow: 'hidden' }}>
      {/* Hero Section with Carousel */}
      <Slider {...sliderSettings}>
        {carouselImages.map((imgUrl, index) => (
          <HeroSlide key={index} sx={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${imgUrl})`}}>
            <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  textShadow: '3px 3px 10px rgba(0,0,0,0.7)',
                }}
              >
                🌾{' '}
                <span style={{ color: theme.palette.primary.light }}>Krishi</span>
                <span style={{ color: theme.palette.secondary.main }}>Mitra</span>
              </Typography>
              
              <Typography
                variant="h5"
                component="p"
                sx={{
                  color: '#f1f8e9',
                  textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
                  maxWidth: '800px'
                }}
              >
                Empowering <span style={{ color: theme.palette.primary.light, fontWeight: 'bold' }}>Farmers</span>. 
                Enhancing <span style={{ color: theme.palette.secondary.light, fontWeight: 'bold' }}>Sustainability</span>.
              </Typography>

            </Container>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleScrollDown}
              startIcon={<ArrowDownwardIcon />}
              sx={{
                position: 'absolute',
                bottom: '5vh',
                left: '50%',
                transform: 'translateX(-50%)',
                animation: `${bounce} 2.5s infinite`,
                animationDelay: '1s',
                borderRadius: '50px',
                px: 4,
                boxShadow: '0px 10px 20px rgba(0,0,0,0.4)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              Know More
            </Button>
          </HeroSlide>
        ))}
      </Slider>

      {/* Features Section */}
      <Box ref={featuresRef} sx={{ py: 8 }}>
        <Container>
            <SectionTitle variant="h3">🌱 What You Can Do Here:</SectionTitle>
            <Grid container spacing={4}>
            {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', borderRadius: '16px', '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 } }}>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 2, width: 56, height: 56 }}>{feature.icon}</Avatar>
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {feature.title} {feature.status && <Chip label={feature.status} color="secondary" size="small" />}
                    </Typography>
                    <Typography color="text.secondary">
                        {feature.description}
                    </Typography>
                    </CardContent>
                </Card>
                </Grid>
            ))}
            </Grid>
        </Container>
      </Box>
      
      {/* Why KrishiMitra Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container>
            <SectionTitle variant="h3">🧑‍🌾 Why KrishiMitra?</SectionTitle>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <List>
                {whyPoints.map((point, index) => (
                <ListItem key={index}>
                    <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <CheckCircleIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={point} primaryTypographyProps={{ fontSize: '1.1rem' }} />
                </ListItem>
                ))}
            </List>
            </Box>
        </Container>
      </Box>
      
      {/* Final CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.dark', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>🚀 Join Us to Get Started:</Typography>
          <Button variant="contained" color="secondary" size="large" onClick={onGetStarted} sx={{ mt: 2 }}>
            👨‍🌾 Farmer Login / Signup
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h6" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            🌍 Let’s build a sustainable farming future together.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontFamily: 'Merriweather, serif' }}>
            “The future of agriculture is not just in the soil, but in how we use technology to nurture it.”
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;