import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';

interface MentorFormProps {
  initialData?: {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    doj?: string;
    gender?: string;
    isActive?: boolean;
    phone?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

const MentorForm: React.FC<MentorFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    doj: new Date().toISOString().split('T')[0],
    gender: '',
    isActive: true,
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        doj: initialData.doj ? initialData.doj.split('T')[0] : new Date().toISOString().split('T')[0],
        gender: initialData.gender || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        phone: initialData.phone || '',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEdit && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.doj) {
      newErrors.doj = 'Date of Joining is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let submitData: any = { ...formData };
    
    if (isEdit && !formData.password) {
      // For edit, remove password if not provided
      const { password, ...rest } = submitData;
      submitData = rest;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Card>
        <CardHeader
          title={isEdit ? 'Edit Mentor' : 'Create New Mentor'}
          subheader="Manage mentor information and access"
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading || isEdit}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isEdit ? 'Password (leave blank to keep current)' : 'Password'}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Joining"
                  name="doj"
                  type="date"
                  value={formData.doj}
                  onChange={handleChange}
                  error={!!errors.doj}
                  helperText={errors.doj}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    label="Gender"
                    value={formData.gender}
                    onChange={(e: SelectChangeEvent) => {
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }));
                      if (errors.gender) {
                        setErrors((prev) => ({ ...prev, gender: '' }));
                      }
                    }}
                    disabled={loading}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleSwitchChange}
                      disabled={loading}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {isEdit ? 'Update' : 'Create'} Mentor
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MentorForm;
