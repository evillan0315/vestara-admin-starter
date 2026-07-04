import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  styled,
} from '@mui/material';
import { registerSchema, type RegisterInput } from '@vestara/validation';
import { useAuth } from '../features/auth/AuthContext';

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

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Create account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your details to get started
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <FormTextField
              label="First name"
              placeholder="John"
              fullWidth
              autoComplete="given-name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              {...register('firstName')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormTextField
              label="Last name"
              placeholder="Doe"
              fullWidth
              autoComplete="family-name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              {...register('lastName')}
            />
          </Grid>
        </Grid>

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

        <FormTextField
          label="Password"
          type="password"
          placeholder="Create a password"
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
            'Create account'
          )}
        </SubmitButton>
      </Form>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <StyledRouterLink to="/login">
          Sign in
        </StyledRouterLink>
      </Typography>
    </Box>
  );
}

export default RegisterPage;
