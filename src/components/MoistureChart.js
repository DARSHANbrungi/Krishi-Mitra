// src/components/MoistureChart.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Area } from 'recharts';
import { Typography, Paper } from '@mui/material';

// NEW: Custom Tooltip for a nicer design
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="body2">{`Time: ${label}`}</Typography>
        <Typography variant="body1" sx={{ color: '#8884d8', fontWeight: 'bold' }}>{`Moisture: ${payload[0].value}%`}</Typography>
      </Paper>
    );
  }
  return null;
};


const MoistureChart = ({ fieldId }) => { 
  const [data, setData] = useState([]);
  const GLOBAL_TEST_FIELD_ID = "global-test-field-01";

  // For now, we'll hardcode the ideal range. Later, this can come from the field's crop type.
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
  }, []);

  if (data.length === 0) {
    return <Typography>Waiting for global sensor data...</Typography>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 20 }} // Increased bottom margin for label
      >
        {/* NEW: SVG Gradient definition for the line and area colors */}
        <defs>
          <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ff8f00" stopOpacity={0.8}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="time" />
        <YAxis domain={[0, 100]} label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft' }} />
        
        {/* UPDATED: Using the new custom tooltip */}
        <Tooltip content={<CustomTooltip />} />

        {/* NEW: Reference area to show the ideal moisture range */}
        <ReferenceArea 
          y1={idealMoistureRange.min} 
          y2={idealMoistureRange.max} 
          strokeOpacity={0.3} 
          fill="#4caf50" // Light green fill
          fillOpacity={0.1}
          label={{ value: "Ideal Range", position: "insideTopLeft", fill: "#4caf50", fontSize: 12 }}
        />
        
        {/* NEW: Area under the line using the gradient */}
        <Area type="monotone" dataKey="value" stroke="none" fill="url(#colorMoisture)" fillOpacity={0.3} />

        {/* UPDATED: Line now uses the gradient color */}
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