import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Snackbar, Alert } from '@mui/material';
import MentorForm from './MentorForm';
import { api } from '../../../core/api';

const MentorCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.post('/mentor', data);
      setSnackbar({
        open: true,
        message: 'Mentor created successfully',
        severity: 'success',
      });
      setTimeout(() => navigate('/admin/mentors'), 1500);
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to create mentor';
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <MentorForm onSubmit={handleSubmit} loading={loading} />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MentorCreatePage;
