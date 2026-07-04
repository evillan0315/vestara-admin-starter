import { useState } from 'react';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  styled,
} from '@mui/material';
import { resetPasswordSchema, type ResetPasswordInput } from '@vestara/validation';
import { apiClient } from '../api/client';

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const FormTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
  },
}));

const SubmitButton = styled(Button)(() => ({
  borderRadius: 8,
  padding: '10px 24px',
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
}));

const StyledRouterLink = styled(RouterLink)(() => ({
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'inherit',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
    },
  });

  if (!token) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="error">
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Invalid reset link
          </Typography>
          <Typography variant="body2">
            This password reset link is invalid or has expired. Please request a
            new one.
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          <StyledRouterLink to="/forgot-password">
            Request new reset link
          </StyledRouterLink>
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          <StyledRouterLink to="/login">
            Back to sign in
          </StyledRouterLink>
        </Typography>
      </Box>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token: data.token,
        password: data.password,
      });
      setIsSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to reset password. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="success">
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Password reset successful
          </Typography>
          <Typography variant="body2">
            Your password has been updated. You can now sign in with your new
            password.
          </Typography>
        </Alert>

        <SubmitButton
          variant="contained"
          fullWidth
          onClick={() => navigate('/login', { replace: true })}
        >
          Sign in
        </SubmitButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Reset password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your new password below
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register('token')} />

        <FormTextField
          label="New password"
          type="password"
          placeholder="Enter new password"
          fullWidth
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <SubmitButton
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Reset password'
          )}
        </SubmitButton>
      </Form>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        <StyledRouterLink to="/login">
          Back to sign in
        </StyledRouterLink>
      </Typography>
    </Box>
  );
}

export default ResetPasswordPage;
