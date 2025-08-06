// src/pages/CropRecommenderPage.js
import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CropRecommenderPage = () => {
  const { t } = useTranslation();
  return <Typography variant="h4">{t('Crop Recommender (Coming Soon)')}</Typography>;
};

export default CropRecommenderPage;