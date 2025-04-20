const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

//using mock data for api endpoint testing purposes
const mockUsers = {
    users: [
        { id: 1, name: "Arjun Patel" },
        { id: 2, name: "Priya Sharma" },
        { id: 3, name: "Raj Kumar" },
        { id: 4, name: "Neha Gupta" },
        { id: 5, name: "Vikram Singh" },
        { id: 6, name: "Anshu Saini" },
        { id: 7, name: "Ashutosh Shandilya" },
        { id: 8, name: "Vikas Yadav" },
        { id: 9, name: "Prashant Tyagi" },
        { id: 10, name: "Milind Raj" }
    ]
};

const mockPosts = {
    posts: [
        { id: 1, userId: 1, title: "My First Post", content: "Hello everyone!" },
        { id: 2, userId: 2, title: "Exciting News", content: "Great day ahead!" },
        { id: 3, userId: 3, title: "Tech Update", content: "New features coming soon" },
        { id: 4, userId: 4, title: "Travel Diary", content: "Amazing journey" },
        { id: 5, userId: 5, title: "Food Blog", content: "Delicious recipes" },
        { id: 6, userId: 6, title: "AI Innovations", content: "Future of technology" },
        { id: 7, userId: 7, title: "Web Development", content: "Best practices in coding" },
        { id: 8, userId: 8, title: "Data Science", content: "Understanding ML concepts" },
        { id: 9, userId: 9, title: "Cloud Computing", content: "AWS vs Azure" },
        { id: 10, userId: 10, title: "DevOps Culture", content: "Continuous Integration" }
    ]
};

const mockComments = {
    comments: [
        { id: 1, postId: 1, text: "Nice post!" },
        { id: 2, postId: 1, text: "Welcome!" },
        { id: 3, postId: 2, text: "Congratulations!" },
        { id: 4, postId: 3, text: "Looking forward to it" },
        { id: 5, postId: 4, text: "Beautiful pictures" },
        { id: 6, postId: 5, text: "Great recipes!" },
        { id: 7, postId: 6, text: "Fascinating insights" },
        { id: 8, postId: 6, text: "AI is the future" },
        { id: 9, postId: 7, text: "Very informative" },
        { id: 10, postId: 7, text: "Thanks for sharing" },
        { id: 11, postId: 8, text: "Excellent explanation" },
        { id: 12, postId: 8, text: "Need more examples" },
        { id: 13, postId: 9, text: "Detailed comparison" },
        { id: 14, postId: 9, text: "Cloud is essential" },
        { id: 15, postId: 10, text: "DevOps is crucial" }
    ]
};

//data structures for caching and analytics
let userPostsCache = new Map(); // userId -> posts count
let postCommentsCache = new Map(); // postId -> comments count
let latestPosts = [];

//function to fetch data from the social media API
async function fetchFromAPI(endpoint) {
    try {
        if (endpoint === '/users') {
            return mockUsers;
        } else if (endpoint.includes('/posts')) {
            if (endpoint.includes('/comments')) {
                return mockComments;
            }
            return mockPosts;
        }
        return { error: 'Invalid endpoint' };
    } catch (error) {
        console.error(`Error fetching from API: ${error.message}`);
        throw error;
    }
}

// Helper function to get comments count for a post
async function getCommentsCount(postId) {
    if (postCommentsCache.has(postId)) {
        return postCommentsCache.get(postId);
    }
    
    const comments = await fetchFromAPI(`/posts/${postId}/comments`);
    const count = comments.comments.length;
    postCommentsCache.set(postId, count);
    return count;
}

// Helper function to update user posts analytics
async function updateUserAnalytics(userId) {
    const posts = await fetchFromAPI(`/users/${userId}/posts`);
    let totalComments = 0;
    
    for (const post of posts.posts) {
        const commentCount = await getCommentsCount(post.id);
        totalComments += commentCount;
    }
    
    userPostsCache.set(userId, totalComments);
    return totalComments;
}

//api end point for top users 
app.get('/users', async (req, res) => {
    try {
        const users = await fetchFromAPI('/users');
        const userAnalytics = [];

        //processing each users posts and comments
        if (!users || !users.users || !Array.isArray(users.users)) {
            throw new Error('Invalid response format from users API');
        }
        
        for (const user of users.users) {
            const commentCount = await updateUserAnalytics(user.id);
            userAnalytics.push({ userId: user.id, name: user.name, commentCount });
        }

        //sorting the users based on comment count to get top 5
        const topUsers = userAnalytics
            .sort((a, b) => b.commentCount - a.commentCount)
            .slice(0, 5);

        res.json({ users: topUsers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//top/latest posts endpoint
app.get('/posts', async (req, res) => {
    try {
        const type = req.query.type || 'latest';
        const users = await fetchFromAPI('/users');
        
        //validating the users response
        if (!users || !Array.isArray(users.users)) {
            throw new Error('Invalid response format from users API');
        }
        
        let allPosts = [];

        //posts for all users
        for (const user of users.users) {
            const userPosts = await fetchFromAPI(`/users/${user.id}/posts`);
            if (userPosts && Array.isArray(userPosts.posts)) {
                allPosts = allPosts.concat(userPosts.posts);
            }
        }

        if (type === 'latest') {
            //latest 5 posts
            const latest = allPosts
                .sort((a, b) => b.id - a.id)
                .slice(0, 5);
            res.json({ posts: latest });
        } else if (type === 'popular') {
            //comment counts on posts
            const postsWithComments = await Promise.all(
                allPosts.map(async (post) => {
                    const commentCount = await getCommentsCount(post.id);
                    return { ...post, commentCount };
                })
            );

            //post with maximum comments
            const maxComments = Math.max(...postsWithComments.map(p => p.commentCount));
            const popularPosts = postsWithComments.filter(p => p.commentCount === maxComments);
            res.json({ posts: popularPosts });
        } else {
            res.status(400).json({ error: 'Invalid type parameter' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//endpoint for getting comments directly by postid's
app.get('/posts/:postId/comments', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const comments = await fetchFromAPI(`/posts/${postId}/comments`);
        if (!comments || !comments.comments) {
            return res.status(404).json({ error: 'Comments not found' });
        }

        res.json({ comments: comments.comments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});