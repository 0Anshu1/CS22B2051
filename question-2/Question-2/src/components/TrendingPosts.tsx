import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Container,CardMedia, CardHeader, Avatar, CircularProgress, Box, Fade } from '@mui/material';
import Grid from '@mui/material/Grid'; 
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  commentCount: number;
  imageUrl: string;
}

const TrendingPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/posts?type=popular');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        //transforming the data to include required fields and comment counts
        const transformedPosts = data.posts.map((post: { id: any; }) => ({
          ...post,
          imageUrl: '/devops.png',
          author: 'Anonymous',
          commentCount: Math.floor(Math.random() * 10) + 1 // Simulating comment counts
        }));
        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
        setError('Failed to load trending posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
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
        Trending Posts
      </Typography>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Fade in={true} timeout={500}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }}
              >
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
                  subheader={
                    <Typography variant="subtitle2" color="text.secondary">
                      By {post.author} • {post.commentCount} comments
                    </Typography>
                  }
                />
                <CardMedia
                  component="img"
                  height="200"
                  image={post.imageUrl}
                  alt={post.title}
                  sx={{
                    objectFit: 'cover',
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

export default TrendingPosts;