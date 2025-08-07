// src/pages/FieldListPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography, Card, CardContent, CircularProgress, CardActionArea, CardMedia, Chip, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../App';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import LandscapeIcon from '@mui/icons-material/Landscape';
import { useTranslation } from 'react-i18next';

const cropImages = {
    pomegranate: 'https://images.pexels.com/photos/2294477/pexels-photo-2294477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    wheat: 'https://images.pexels.com/photos/1753456/pexels-photo-1753456.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rice: 'https://images.pexels.com/photos/2346083/pexels-photo-2346083.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    ragi: 'https://images.pexels.com/photos/7319106/pexels-photo-7319106.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    default: 'https://images.pexels.com/photos/2132126/pexels-photo-2132126.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
};

const FieldListPage = () => {
    const { t } = useTranslation();
    const { user } = useApp();
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState(null);

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

    const handleDeleteClick = (field) => {
        setFieldToDelete(field);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setFieldToDelete(null);
        setOpenDeleteDialog(false);
    };

    const handleConfirmDelete = async () => {
        if (!fieldToDelete) return;

        try {
            // First, delete all expenses in the sub-collection
            const expensesRef = collection(db, `users/${user.uid}/fields/${fieldToDelete.id}/expenses`);
            const expensesSnapshot = await getDocs(expensesRef);
            expensesSnapshot.forEach(async (expenseDoc) => {
                await deleteDoc(doc(expensesRef, expenseDoc.id));
            });

            // Then, delete the main field document
            await deleteDoc(doc(db, `users/${user.uid}/fields`, fieldToDelete.id));

        } catch (error) {
            console.error("Error deleting field and its expenses: ", error);
            alert("Failed to delete field.");
        } finally {
            handleCloseDeleteDialog();
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (fields.length === 0 && !loading) {
        return (
            <Box textAlign="center" mt={5}>
                <LandscapeIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>{t('yourFarmIsEmpty')}</Typography>
                <Typography>{t('clickAddNewField')}</Typography>
                <Button onClick={() => navigate('/app/create-field')} variant="contained" sx={{ mt: 3 }}>{t('addYourFirstField')}</Button>
            </Box>
        )
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ pl: '0 !important', pr: '0 !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>{t('myFields')}</Typography>
                    <Button onClick={() => navigate('/app/create-field')} variant="contained" startIcon={<AddIcon />}>{t('addNewField')}</Button>
                </Box>
                <Grid container spacing={3}>
                    {fields.map((field) => {
                        const cropKey = field.cropType?.toLowerCase();
                        const imageUrl = cropImages[cropKey] || cropImages.default;
                        return (
                            <Grid item key={field.id} xs={12} sm={6} md={4}>
                                <Card sx={{ height: '100%', borderRadius: '16px', transition: '0.3s', '&:hover': { transform: 'scale(1.03)', boxShadow: 8 }, display: 'flex', flexDirection: 'column' }}>
                                    <CardActionArea onClick={() => navigate(`/app/my-fields/${field.id}`)} sx={{ flexGrow: 1 }}>
                                        <CardMedia component="img" height="140" image={imageUrl} alt={field.cropType} />
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>{field.fieldName}</Typography>
                                            <Chip label={field.cropType} color="primary" sx={{ mb: 2, fontWeight: 'bold' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                <Box component="span" fontWeight="bold">{t('area')}:</Box> {field.acreage} {t('acres')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <Box component="span" fontWeight="bold">{t('sownOn')}:</Box> 
                                                {field.sowingDate ? format(field.sowingDate.toDate(), 'do MMMM yyyy') : 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                <Box component="span" fontWeight="bold">{t('totalExpenses')}:</Box> 
                                                ₹{field.totalExpense?.toLocaleString('en-IN') || 0}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Tooltip title="Delete Field">
                                            <IconButton onClick={() => handleDeleteClick(field)} size="small" color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>

            {/* Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>Delete Field Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the field "{fieldToDelete?.fieldName}"? This will also delete all associated expenses. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FieldListPage;