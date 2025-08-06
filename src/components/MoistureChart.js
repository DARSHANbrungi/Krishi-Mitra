// src/components/MoistureChart.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Area } from 'recharts';
import { Typography, Paper, useTheme } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ padding: '10px' }}>
        <Typography variant="body2">{`Time: ${label}`}</Typography>
        <Typography variant="body1" sx={{ color: '#8884d8', fontWeight: 'bold' }}>{`Moisture: ${payload[0].value}%`}</Typography>
      </Paper>
    );
  }
  return null;
};

const MoistureChart = ({ fieldId }) => { 
  const theme = useTheme();
  const [data, setData] = useState([]);
  const GLOBAL_TEST_FIELD_ID = "global-test-field-01";
  const idealMoistureRange = { min: 40, max: 70 };

  useEffect(() => {
    const q = query(
      collection(db, "moistureReadings"),
      where("fieldId", "==", GLOBAL_TEST_FIELD_ID),
      orderBy("timestamp", "desc"),
      limit(60)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const readings = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        readings.push({
          ...docData,
          time: new Date(docData.timestamp?.toDate()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        });
      });
      setData(readings.reverse());
    });

    return () => unsubscribe();
  }, [fieldId]);

  if (data.length === 0) {
    return <Typography>Waiting for sensor data for this field...</Typography>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey="time" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }} />
        <YAxis 
          domain={[0, 100]} 
          label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }} 
          stroke={theme.palette.text.secondary}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceArea 
          y1={idealMoistureRange.min} 
          y2={idealMoistureRange.max} 
          strokeOpacity={0.3} 
          fill={theme.palette.primary.main}
          fillOpacity={0.1}
          label={{ value: "Ideal Range", position: "insideTopLeft", fill: theme.palette.text.primary, fontSize: 12 }}
        />
        <Area type="monotone" dataKey="value" stroke="none" fill="url(#colorMoisture)" fillOpacity={0.3} />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="url(#colorMoisture)" 
          strokeWidth={3}
          activeDot={{ r: 8 }} 
          dot={false}
          name="Soil Moisture"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MoistureChart;