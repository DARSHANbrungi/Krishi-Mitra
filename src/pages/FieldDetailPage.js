// src/pages/FieldDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Box, Button, CircularProgress, Divider, Breadcrumbs, Link, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, useTheme, DialogContentText } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import MoistureChart from '../components/MoistureChart';
import { useTranslation } from 'react-i18next';

// Icons
import OpacityIcon from '@mui/icons-material/Opacity';
import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import EventIcon from '@mui/icons-material/Event';

import { doc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot, runTransaction, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../App';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, iconColor = 'primary' }) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                borderRadius: '16px',
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'rgba(255, 255, 255, 0.7)',
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
};

const expenseCategories = ['Seeds', 'Fertilizer', 'Pesticides', 'Labor', 'Irrigation', 'Machinery', 'Other'];
const pieChartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19A2FF'];

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, theme } = props;
    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={theme.palette.text.primary} fontSize="1.2rem" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={theme.palette.text.secondary} fontSize="0.9rem">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
        </g>
    );
};

const CustomTooltip = ({ active, payload }) => {
    const theme = useTheme();
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <Paper
                elevation={4}
                sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    bgcolor: 'background.paper',
                }}
            >
                <Typography variant="body2" sx={{color: data.payload.fill, fontWeight:'bold'}}>{data.name}</Typography>
                <Typography color="text.primary" variant="caption">Amount: ₹{data.value.toLocaleString('en-IN')}</Typography>
                <br/>
                <Typography color="text.secondary" variant="caption">Percentage: {(data.payload.percent * 100).toFixed(1)}%</Typography>
            </Paper>
        );
    }
    return null;
};

const FieldDetailPage = () => {
    const { t } = useTranslation();
    const { fieldId } = useParams();
    const navigate = useNavigate();
    const { user } = useApp();
    const theme = useTheme();
    const [field, setField] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date());
    const [expenseCategory, setExpenseCategory] = useState('');
    const [latestMoisture, setLatestMoisture] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        const fetchFieldData = async () => {
            if (user && fieldId) {
                const fieldRef = doc(db, 'users', user.uid, 'fields', fieldId);
                const docSnap = await getDoc(fieldRef);
                if (docSnap.exists()) {
                    setField(docSnap.data());
                } else {
                    console.error("No such field found!");
                }
                setLoading(false);
            }
        };
        fetchFieldData();
    }, [fieldId, user]);

    useEffect(() => {
        if (!user || !fieldId) return;
        const expensesRef = collection(db, `users/${user.uid}/fields/${fieldId}/expenses`);
        const q = query(expensesRef, orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(expensesData);
        });
        return () => unsubscribe();
    }, [fieldId, user]);

    useEffect(() => {
        if (!fieldId) return;
        const readingsRef = collection(db, "moistureReadings");
        const q = query(readingsRef, where("fieldId", "==", "global-test-field-01"), orderBy("timestamp", "desc"), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestMoisture(snapshot.docs[0].data().value);
            } else {
                setLatestMoisture('N/A');
            }
        });
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
                    createdAt: serverTimestamp()
                });
            });
            setOpenExpenseDialog(false);
        } catch (e) {
            console.error("Transaction failed: ", e);
            alert("Failed to add expense.");
        }
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

    const onPieEnter = (_, index) => { setActiveIndex(index); };
    const onPieMouseLeave = () => { setActiveIndex(null); };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    const panelStyle = {
        p: { xs: 2, md: 3 },
        borderRadius: '16px',
        height: '100%',
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'rgba(255, 255, 255, 0.7)',
        boxShadow: 3
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <Link component="button" sx={{textDecoration:'none'}}  color="inherit" onClick={() => navigate('/app/my-fields')}>
                        {t('myFields')}
                    </Link>
                    <Typography color="text.primary">{field?.fieldName}</Typography>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                    {field?.fieldName} {t('fieldDashboard')}
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title={t('totalExpenses')} value={`₹${field?.totalExpense?.toLocaleString('en-IN') || 0}`} icon={<MonetizationOnIcon />} iconColor="success" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Current Moisture" value={latestMoisture !== 'N/A' ? `${latestMoisture}%` : 'N/A'} icon={<OpacityIcon />} iconColor="info" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title={t('fieldArea')} value={`${field?.acreage || 0} ${t('acres')}`} icon={<SquareFootIcon />} iconColor="warning" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title={t('sowingDateLabel')} value={field?.sowingDate ? format(field.sowingDate.toDate(), 'do MMM yyyy') : 'N/A'} icon={<EventIcon />} iconColor="primary" />
                    </Grid>
                </Grid>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)} aria-label="dashboard tabs">
                        <Tab label={t('overview')} />
                        <Tab label={t('financials')} />
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <Paper sx={panelStyle}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <OpacityIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>{t('soilMoisture')}</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <MoistureChart fieldId={fieldId} />
                    </Paper>
                )}

                {tabValue === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{...panelStyle, p: 2, height: 450, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>{t('expenseBreakdown')}</Typography>
                                <Box sx={{ flex: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        {expenseChartData.length > 0 ? (
                                            <PieChart>
                                                <RechartsTooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                                <Legend iconSize={12} wrapperStyle={{ color: theme.palette.text.primary, fontSize: '0.9rem' }} />
                                                <Pie 
                                                    activeIndex={activeIndex}
                                                    activeShape={(props) => renderActiveShape({ ...props, theme })}
                                                    data={expenseChartData} 
                                                    dataKey="value" nameKey="name" cx="50%" cy="50%" 
                                                    innerRadius={70} outerRadius={100} fill="#8884d8" paddingAngle={3}
                                                    onMouseEnter={onPieEnter} onMouseLeave={onPieMouseLeave}
                                                >
                                                    {expenseChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                                                    ))}
                                                </Pie>
                                                {activeIndex === null && (
                                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill={theme.palette.text.secondary}>
                                                        <tspan x="50%" dy="-0.6em" fontSize="0.9em">{t('total')}</tspan>
                                                        <tspan x="50%" dy="1.2em" fontSize="1.4em" fontWeight="bold" fill={theme.palette.text.primary}>
                                                            ₹{field?.totalExpense?.toLocaleString('en-IN') || 0}
                                                        </tspan>
                                                    </text>
                                                )}
                                            </PieChart>
                                        ) : (
                                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                                                <Typography color="text.secondary">{t('noExpenseData')}</Typography>
                                            </Box>
                                        )}
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={panelStyle}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>{t('expenseLog')}</Typography>
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenExpenseDialog}>{t('addExpense')}</Button>
                                </Box>
                                <TableContainer sx={{ mt: 2, maxHeight: 310 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{backgroundColor: 'background.paper'}}>{t('date')}</TableCell>
                                                <TableCell sx={{backgroundColor: 'background.paper'}}>{t('category')}</TableCell>
                                                <TableCell sx={{backgroundColor: 'background.paper'}}>{t('description')}</TableCell>
                                                <TableCell sx={{backgroundColor: 'background.paper'}} align="right">{t('amount')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {expenses.map((expense) => (
                                                <TableRow key={expense.id}>
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
                    <DialogTitle>{t('addNewExpense')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{t('logNewExpenseFor', { fieldName: field?.fieldName })}.</DialogContentText>
                        <FormControl variant="standard" fullWidth sx={{ mt: 2 }} required>
                            <InputLabel>{t('category')}</InputLabel>
                            <Select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} label={t('category')}>
                                {expenseCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField margin="dense" label={`${t('description')} (optional)`} type="text" fullWidth variant="standard" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} />
                        <TextField margin="dense" label={`${t('amount')} (₹)`} type="number" fullWidth variant="standard" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} required />
                        <DatePicker label={t('date')} value={expenseDate} onChange={(date) => setExpenseDate(date)} sx={{ width: '100%', mt: 3 }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenExpenseDialog(false)}>{t('cancel')}</Button>
                        <Button onClick={handleAddExpense} variant="contained">{t('saveExpense')}</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default FieldDetailPage;
