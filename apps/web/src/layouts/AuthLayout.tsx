import { Box, Typography, styled } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthContainer = styled(Box)(() => ({
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'background.default',
  padding: '24px',
}));

const AuthCard = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

const LogoSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
}));

const LogoImage = styled('img')(() => ({
  height: 48,
  width: 'auto',
  objectFit: 'contain',
}));

export function AuthLayout() {
  return (
    <AuthContainer>
      <AuthCard>
        <LogoSection>
          <LogoImage src="/logo.svg" alt="Vestara" />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Admin Dashboard
          </Typography>
        </LogoSection>
        <Outlet />
      </AuthCard>
    </AuthContainer>
  );
}

export default AuthLayout;
