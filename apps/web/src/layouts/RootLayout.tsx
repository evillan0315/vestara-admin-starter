import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export function RootLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
