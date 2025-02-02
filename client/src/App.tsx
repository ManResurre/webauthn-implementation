import React from 'react';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import './App.css';
import Private from './components/private';
import PrivateRoutes from './components/privateRoutes';
import CenterLayout from './components/CenterLayout';

function App() {
  return <Router>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          MyApp
        </Typography>

        <Button to="/login" component={Link} color="inherit">Login</Button>
        <Button to="/registration" component={Link} color="inherit">Registration</Button>
      </Toolbar>
    </AppBar>

    <Routes>
      <Route path="/*" element={<CenterLayout />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/private" element={<Private />} />
      </Route>
    </Routes>
  </Router>;
}

export default App;
