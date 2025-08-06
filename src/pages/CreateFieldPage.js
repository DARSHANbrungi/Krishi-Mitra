// src/pages/CreateFieldPage.js
import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../App';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CreateFieldPage = () => {
    const { t } = useTranslation();
    const { user } = useApp();
    const navigate = useNavigate();
    const [fieldName, setFieldName] = useState('');
    const [cropType, setCropType] = useState('');
    const [acreage, setAcreage] = useState('');
    const [sowingDate, setSowingDate] = useState(new Date());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fieldName || !cropType || !acreage || !user) {
            alert("Please fill out all fields");
            return;
        }

        try {
            const fieldsCollectionRef = collection(db, `users/${user.uid}/fields`);
            await addDoc(fieldsCollectionRef, {
                fieldName,
                cropType,
                acreage: Number(acreage),
                sowingDate,
                createdAt: serverTimestamp(),
                totalExpense: 0,
            });
            navigate('/app/my-fields');
        } catch (error) {
            console.error("Error creating field: ", error);
            alert("Failed to create field.");
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '16px' }}>
                    <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
                        {t('createField')}
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            label={t('fieldName')} 
                            value={fieldName} 
                            onChange={(e) => setFieldName(e.target.value)} 
                        />
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            label={t('cropType')} 
                            value={cropType} 
                            onChange={(e) => setCropType(e.target.value)} 
                        />
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            label={t('acreageLabel')} 
                            type="number" 
                            value={acreage} 
                            onChange={(e) => setAcreage(e.target.value)} 
                        />
                        <DatePicker 
                            label={t('sowingDateLabel')} 
                            value={sowingDate} 
                            onChange={(newValue) => setSowingDate(newValue)} 
                            sx={{ width: '100%', mt: 2 }} 
                        />
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {t('saveField')}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </LocalizationProvider>
    );
};

export default CreateFieldPage;