// src/pages/FieldDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Box, Button, CircularProgress, Divider, Breadcrumbs, Link, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import MoistureChart from '../components/MoistureChart';

// Icons
import OpacityIcon from '@mui/icons-material/Opacity';
import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import EventIcon from '@mui/icons-material/Event';

import { doc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot, runTransaction, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { format } from 'date-fns';

// A reusable Stat Card component
const StatCard = ({ title, value, icon, iconColor = 'primary' }) => (
    <Paper
        elevation={2}
        sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            transition: '0.3s',
            '&:hover': { boxShadow: 6 },
        }}
    >
        {React.cloneElement(icon, { color: iconColor, sx:{ fontSize: 40 } })}
        <Box ml={2}>
            <Typography variant="h6" color="text.primary">{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

// Predefined categories for expenses
const expenseCategories = ['Seeds', 'Fertilizer', 'Pesticides', 'Labor', 'Irrigation', 'Machinery', 'Other'];
// Colors for the Pie Chart
const pieChartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19A2FF'];

const FieldDetailPage = () => {
    const { fieldId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [field, setField] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    // Expense state
    const [expenses, setExpenses] = useState([]);
    const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date());
    const [expenseCategory, setExpenseCategory] = useState('');

    const [latestMoisture, setLatestMoisture] = useState(null);

    useEffect(() => {
        const fetchFieldData = async () => { if (user && fieldId) { const fieldRef = doc(db, 'users', user.uid, 'fields', fieldId); const docSnap = await getDoc(fieldRef); if (docSnap.exists()) { setField(docSnap.data()); } else { console.error("No such field found!"); } setLoading(false); }};
        fetchFieldData();
    }, [fieldId, user]);

    useEffect(() => {
        if (!user || !fieldId) return;
        const expensesRef = collection(db, `users/${user.uid}/fields/${fieldId}/expenses`);
        const q = query(expensesRef, orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => { const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setExpenses(expensesData); });
        return () => unsubscribe();
    }, [fieldId, user]);

    useEffect(() => {
        if (!fieldId) return;
        const readingsRef = collection(db, "moistureReadings");
        const q = query(readingsRef, where("fieldId", "==", "global-test-field-01"), orderBy("timestamp", "desc"), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => { if (!snapshot.empty) { setLatestMoisture(snapshot.docs[0].data().value); } else { setLatestMoisture('N/A'); } });
        return () => unsubscribe();
    }, [fieldId]);

    const handleOpenExpenseDialog = () => {
        setExpenseDesc('');
        setExpenseAmount('');
        setExpenseDate(new Date());
        setExpenseCategory('');
        setOpenExpenseDialog(true);
    };

    const handleAddExpense = async () => {
        if (!expenseCategory || !expenseAmount) return alert('Please fill in a category and amount.');
        const amount = parseFloat(expenseAmount);
        if (isNaN(amount) || amount <= 0) return alert('Please enter a valid amount.');

        const fieldRef = doc(db, 'users', user.uid, 'fields', fieldId);
        const expenseCollectionRef = collection(db, `users/${user.uid}/fields/${fieldId}/expenses`);

        try {
            await runTransaction(db, async (transaction) => {
                const fieldDoc = await transaction.get(fieldRef);
                if (!fieldDoc.exists()) throw "Field document does not exist!";
                
                const newTotalExpense = (fieldDoc.data().totalExpense || 0) + amount;
                transaction.update(fieldRef, { totalExpense: newTotalExpense });
                
                transaction.set(doc(expenseCollectionRef), {
                    description: expenseDesc,
                    amount: amount,
                    date: expenseDate,
                    category: expenseCategory,
                    createdAt: serverTimestamp(),
                });
            });
            setOpenExpenseDialog(false);
        } catch (e) { console.error("Transaction failed: ", e); alert("Failed to add expense."); }
    };

    const getExpenseChartData = () => {
        if (expenses.length === 0) return [];
        const categoryTotals = expenses.reduce((acc, expense) => {
            const category = expense.category || 'Other';
            acc[category] = (acc[category] || 0) + expense.amount;
            return acc;
        }, {});
        return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    };
    const expenseChartData = getExpenseChartData();

    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>; }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <Link component="button" sx={{textDecoration:'none'}}  color="inherit" onClick={() => navigate('/app/my-fields')}>My Fields</Link>
                    <Typography color="text.primary">{field?.fieldName}</Typography>
                </Breadcrumbs>
                
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>{field?.fieldName} Dashboard</Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Total Expenses" value={`₹${field?.totalExpense?.toLocaleString('en-IN') || 0}`} icon={<MonetizationOnIcon />} iconColor="success" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Current Moisture" value={latestMoisture !== 'N/A' ? `${latestMoisture}%` : 'N/A'} icon={<OpacityIcon />} iconColor="info" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Field Area" value={`${field?.acreage || 0} acres`} icon={<SquareFootIcon />} iconColor="warning" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Sowing Date" value={field?.sowingDate ? format(field.sowingDate.toDate(), 'do MMM yyyy') : 'N/A'} icon={<EventIcon />} iconColor="primary" />
                    </Grid>
                </Grid>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)} aria-label="dashboard tabs">
                        <Tab label="Overview" />
                        <Tab label="Financials" />
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', boxShadow: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <OpacityIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>Real-time Soil Moisture</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <MoistureChart fieldId={fieldId} />
                    </Paper>
                )}

                {tabValue === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={5}>
                             <Paper sx={{ p: 2, borderRadius: '16px', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', boxShadow: 3 }}>
                                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>Expense Breakdown</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    {expenseChartData.length > 0 ? (
                                        <PieChart>
                                            <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                                {expenseChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                            <Legend />
                                        </PieChart>
                                    ) : (
                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                                            <Typography color="text.secondary">No expense data for chart.</Typography>
                                        </Box>
                                    )}
                                </ResponsiveContainer>
                             </Paper>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', boxShadow: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>Expense Log</Typography>
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenExpenseDialog}>Add Expense</Button>
                                </Box>
                                <TableContainer sx={{ mt: 2, maxHeight: 260 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{backgroundColor: 'transparent'}}>Date</TableCell>
                                                <TableCell sx={{backgroundColor: 'transparent'}}>Category</TableCell>
                                                <TableCell sx={{backgroundColor: 'transparent'}}>Description</TableCell>
                                                <TableCell sx={{backgroundColor: 'transparent'}} align="right">Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {expenses.map((expense) => (
                                                <TableRow key={expense.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell>{format(expense.date.toDate(), 'dd/MM/yy')}</TableCell>
                                                    <TableCell>{expense.category}</TableCell>
                                                    <TableCell>{expense.description}</TableCell>
                                                    <TableCell align="right">₹{expense.amount.toLocaleString('en-IN')}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                <Dialog open={openExpenseDialog} onClose={() => setOpenExpenseDialog(false)}>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Log a new expense for {field?.fieldName}.</DialogContentText>
                        <FormControl variant="standard" fullWidth sx={{ mt: 2 }} required>
                            <InputLabel>Category</InputLabel>
                            <Select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} label="Category">
                                {expenseCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField margin="dense" label="Description (optional)" type="text" fullWidth variant="standard" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} />
                        <TextField margin="dense" label="Amount (₹)" type="number" fullWidth variant="standard" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} required/>
                        <DatePicker label="Expense Date" value={expenseDate} onChange={(date) => setExpenseDate(date)} sx={{ width: '100%', mt: 3 }}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenExpenseDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddExpense} variant="contained">Save Expense</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default FieldDetailPage;