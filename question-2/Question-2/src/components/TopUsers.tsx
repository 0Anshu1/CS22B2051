import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Container, CircularProgress, Box, Fade } from '@mui/material';
import { Person } from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  commentCount: number;
}

const TopUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching top users:', error);
        setError('Failed to load top users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: 'center',
          mb: 4
        }}
      >
        Top Users
      </Typography>
      <Fade in={true} timeout={500}>
        <Card sx={{
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          }
        }}>
          <CardContent>
            <List>
              {users.map((user, index) => (
                <ListItem 
                  key={user.id}
                  sx={{
                    transition: 'background-color 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    },
                    borderRadius: 1,
                    mb: index < users.length - 1 ? 1 : 0
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'secondary.main',
                        transform: 'scale(1.2)'
                      }}
                    >
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {/*{user.commentCount} comments*/}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default TopUsers;