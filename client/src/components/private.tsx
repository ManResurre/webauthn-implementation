import React from 'react';
import { Alert, Box, Card, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

function Private() {
  const userId = localStorage.getItem('userId');

  return <>
    <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
      Congratulations you are logged in.
    </Alert>
    <Card>
      <Box p={1}>
        <Typography variant={'h5'}>Your ID: {userId}</Typography>
      </Box>
    </Card>
  </>;
}

export default Private;
