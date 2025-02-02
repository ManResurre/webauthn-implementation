import React from 'react';
import Grid from '@mui/material/Grid2';
import { Route, Routes } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import LoginForm from './loginForm/LoginForm';
import RegistrationForm from './registrationForm/RegistrationForm';

function CenterLayout() {

  return <Grid container sx={{
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  }} spacing={1}>
    <Grid>
      <Paper variant="outlined">
        <Box p={1}>
          <Routes>
            <Route path="/*" element={<LoginForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/registration" element={<RegistrationForm />} />
          </Routes>
        </Box>
      </Paper>
    </Grid>
  </Grid>;
}

export default CenterLayout;
