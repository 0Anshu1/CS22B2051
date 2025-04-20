import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import TopUsers from './components/TopUsers';
import TrendingPosts from './components/TrendingPosts';
import Feed from './components/Feed';
import './App.css';

function App() {
  return (
    <Router>
      <AppBar 
        position="static" 
        sx={{
          backgroundColor: 'primary.main',
          boxShadow: 3,
          mb: 2
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: 1,
              color: 'white'
            }}
          >
            Social Media Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/"
              sx={{
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Feed
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/trending"
              sx={{
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Trending
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/top-users"
              sx={{
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Top Users
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/trending" element={<TrendingPosts />} />
          <Route path="/top-users" element={<TopUsers />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
