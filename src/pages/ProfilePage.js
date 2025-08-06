// src/pages/ProfilePage.js
import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, Button, TextField, CircularProgress, Alert, Grid, Divider } from '@mui/material';
import { useApp } from '../App';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

const ProfilePage = () => {
    const { t } = useTranslation();
    const { user } = useApp();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleProfileUpdate = async () => {
        if (displayName.trim() === '') {
            setError('Display name cannot be empty.');
            return;
        }
        setError('');
        setSuccess('');
        setIsSaving(true);
        try {
            if (displayName !== user?.displayName) {
                await updateProfile(auth.currentUser, { displayName });
            }
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePictureUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME") {
            setError("Cloudinary details are not set in the code.");
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        try {
            const response = await axios.post(url, formData);
            const photoURL = response.data.secure_url;
            
            await updateProfile(auth.currentUser, { photoURL });
            
            setSuccess('Profile picture updated! It may take a moment to reflect across the app.');
        } catch (err) {
            setError('Failed to upload picture. Please try again.');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                {t('profileSettings')}
            </Typography>
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px' }}>
                <Grid container spacing={4} alignItems="flex-start">
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={user?.photoURL}
                            sx={{ width: 150, height: 150, mx: 'auto', mb: 2, fontSize: '4rem', border: '4px solid', borderColor: 'primary.main' }}
                        >
                            {user?.displayName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCamera />}
                            disabled={isUploading}
                        >
                            {isUploading ? t('uploading') : t('changePicture')}
                            <input type="file" hidden accept="image/*" onChange={handlePictureUpload} />
                        </Button>
                        <Typography variant="caption" display="block" sx={{mt: 1, color: 'text.secondary'}}>
                            Recommended size: square, under 2MB
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>{t('yourInformation')}</Typography>
                        <Divider sx={{mb: 2}} />
                        <TextField
                            label={t('displayName')}
                            variant="outlined"
                            fullWidth
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label={t('emailAddress')}
                            variant="outlined"
                            fullWidth
                            value={user?.email || ''}
                            disabled
                            helperText={t('emailCannotBeChanged')}
                            sx={{ mb: 3 }}
                        />
                        <Button variant="contained" onClick={handleProfileUpdate} disabled={isSaving}>
                            {isSaving ? <CircularProgress size={24} color="inherit" /> : t('saveChanges')}
                        </Button>
                        
                        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ProfilePage;