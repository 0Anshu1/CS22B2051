import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Container,CardMedia, CardHeader, Avatar, CircularProgress, Box, Fade } from '@mui/material';
import Grid from '@mui/material/Grid';
interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  timestamp?: string;
  imageUrl: string;
  author: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/posts?type=latest');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Get users data to map user IDs to names
        const usersResponse = await fetch('http://localhost:3000/users');
        if (!usersResponse.ok) {
          throw new Error(`HTTP error! status: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();
        const userMap = usersData.users.reduce((acc: { [key: number]: string }, user: { id: number; name: string }) => {
          acc[user.id] = user.name;
          return acc;
        }, {});

        // Transform the data to include required fields and sort by timestamp
        const transformedPosts = data.posts
          .map((post: { id: any; userId: number; timestamp: string }) => ({
            ...post,
            timestamp: post.timestamp || new Date().toISOString(),
            imageUrl: post.title === 'My First Post' ? '/firstpost.png' : post.title === 'Exciting News' ? '/excitingnews.png' : '/devops.png',
            author: userMap[post.userId] || 'Unknown User'
          }))
          .sort((a: { timestamp: string }, b: { timestamp: string }) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
        Latest Posts
      </Typography>
      <Grid container spacing={3}>
        {posts.map((post: Post) => (
          <Grid item xs={12} sm={6} key={post.id}>
            <Fade in={true} timeout={500}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {post.author[0]}
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" component="div">
                      {post.title}
                    </Typography>
                  }
                  subheader={(
                    <Typography variant="subtitle2" color="text.secondary">
                      By {post.author} • {new Date(post.timestamp || Date.now()).toLocaleString()}
                    </Typography>
                  )}
                />
                <CardMedia
                  component="img"
                  height="200"
                  image={post.imageUrl}
                  alt={post.title}
                  sx={{
                    objectFit: 'cover'
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.content}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Feed;