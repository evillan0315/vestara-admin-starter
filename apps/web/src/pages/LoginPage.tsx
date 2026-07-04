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
  styled,
} from '@mui/material';
import { loginSchema, type LoginInput } from '@vestara/validation';
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

const LinksRow = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
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

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
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
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your credentials to access the dashboard
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

        <FormTextField
          label="Password"
          type="password"
          placeholder="Enter your password"
          fullWidth
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <LinksRow>
          <StyledRouterLink to="/forgot-password">
            Forgot password?
          </StyledRouterLink>
        </LinksRow>

        <SubmitButton
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Sign in'
          )}
        </SubmitButton>
      </Form>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Don't have an account?{' '}
        <StyledRouterLink to="/register">
          Create one
        </StyledRouterLink>
      </Typography>
    </Box>
  );
}

export default LoginPage;
