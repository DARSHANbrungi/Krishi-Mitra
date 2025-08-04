// src/pages/FieldListPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography, Card, CardContent, CircularProgress, CardActionArea, CardMedia, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useApp } from '../App';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import LandscapeIcon from '@mui/icons-material/Landscape';

const cropImages = {
    pomegranate: 'https://images.pexels.com/photos/2294477/pexels-photo-2294477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    wheat: 'https://images.pexels.com/photos/1753456/pexels-photo-1753456.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rice: 'https://images.pexels.com/photos/2346083/pexels-photo-2346083.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    default: 'https://images.pexels.com/photos/2132126/pexels-photo-2132126.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
};

const FieldListPage = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fieldsRef = collection(db, `users/${user.uid}/fields`);
        const q = query(fieldsRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fieldsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFields(fieldsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (fields.length === 0) {
        return (
            <Box textAlign="center" mt={5}>
                <LandscapeIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>Your farm is empty</Typography>
                <Typography>Click "Add New Field" to get started and monitor your crops.</Typography>
                <Button onClick={() => navigate('/app/create-field')} variant="contained" sx={{ mt: 3 }}>Add Your First Field</Button>
            </Box>
        )
    }

    return (
        <Container maxWidth="lg" sx={{ pl: '0 !important', pr: '0 !important' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>My Fields</Typography>
                <Button onClick={() => navigate('/app/create-field')} variant="contained" startIcon={<AddIcon />}>Add New Field</Button>
            </Box>
            <Grid container spacing={3}>
                {fields.map((field) => {
                    const cropKey = field.cropType?.toLowerCase();
                    const imageUrl = cropImages[cropKey] || cropImages.default;
                    return (
                        <Grid item key={field.id} xs={12} sm={6} md={4}>
                            <Card sx={{ height: '100%', borderRadius: '16px', transition: '0.3s', '&:hover': { transform: 'scale(1.03)', boxShadow: 8 } }}>
                                <CardActionArea onClick={() => navigate(`/app/my-fields/${field.id}`)} sx={{ height: '100%' }}>
                                    <CardMedia component="img" height="140" image={imageUrl} alt={field.cropType} />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>{field.fieldName}</Typography>
                                        <Chip label={field.cropType} color="primary" sx={{ mb: 2, fontWeight: 'bold' }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box component="span" fontWeight="bold" mr={1}>Area:</Box> {field.acreage} acres
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box component="span" fontWeight="bold" mr={1}>Sown on:</Box> 
                                            {field.sowingDate ? format(field.sowingDate.toDate(), 'do MMMM yyyy') : 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Box component="span" fontWeight="bold" mr={1}>Total Expenses:</Box> 
                                            ₹{field.totalExpense?.toLocaleString('en-IN') || 0}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default FieldListPage;