import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import { forgotPasswordSchema, type ForgotPasswordInput } from '@vestara/validation';
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

const StyledButton = styled('button')(({ theme }) => ({
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.primary.main,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to send reset email. Please try again.';
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
            Check your email
          </Typography>
          <Typography variant="body2">
            We've sent a password reset link to <strong>{submittedEmail}</strong>.
            Please check your inbox and follow the instructions.
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Didn't receive the email?{' '}
          <StyledButton
            onClick={() => {
              setIsSuccess(false);
              setSubmittedEmail('');
            }}
          >
            Try again
          </StyledButton>
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          <StyledRouterLink to="/login">
            Back to sign in
          </StyledRouterLink>
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Forgot password?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email and we'll send you a reset link
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormTextField
          label="Email"
          type="email"
          placeholder="you@example.com"
          fullWidth
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
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
            'Send reset link'
          )}
        </SubmitButton>
      </Form>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Remember your password?{' '}
        <StyledRouterLink to="/login">
          Sign in
        </StyledRouterLink>
      </Typography>
    </Box>
  );
}

export default ForgotPasswordPage;
