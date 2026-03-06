import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Snackbar, Alert, CircularProgress } from '@mui/material';
import MentorForm from './MentorForm';
import { api } from '../../../core/api';

const MentorEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mentor, setMentor] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) {
        setSnackbar({
          open: true,
          message: 'Mentor ID not found',
          severity: 'error',
        });
        navigate('/admin/mentors');
        return;
      }

      try {
        const response = await api.get(`/mentor/${id}`);
        setMentor(response.data);
      } catch (error: any) {
        const message = error.response?.data?.msg || 'Failed to fetch mentor';
        setSnackbar({
          open: true,
          message,
          severity: 'error',
        });
        setTimeout(() => navigate('/admin/mentors'), 1500);
      } finally {
        setFetching(false);
      }
    };

    fetchMentor();
  }, [id, navigate]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.put(`/mentor/${id}`, data);
      setSnackbar({
        open: true,
        message: 'Mentor updated successfully',
        severity: 'success',
      });
      setTimeout(() => navigate('/admin/mentors'), 1500);
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to update mentor';
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      {mentor && (
        <MentorForm
          initialData={mentor}
          onSubmit={handleSubmit}
          loading={loading}
          isEdit={true}
        />
      )}
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

export default MentorEditPage;
