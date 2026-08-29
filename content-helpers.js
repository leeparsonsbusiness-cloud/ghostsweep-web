// Content Script Helper Methods for GhostSweep

// Main API methods for EmbeddedInstagramAPI
EmbeddedInstagramAPI.prototype.getRealUserData = async function() {
    try {
        if (!this.currentUser) {
            const user = this.detectCurrentUser();
            if (!user) throw new Error('No logged-in user detected');
            this.currentUser = user;
        }
        
        const userData = {
            followers: await this.getFollowersReal(this.currentUser),
            following: await this.getFollowingReal(this.currentUser)
        };
        
        return {
            ...userData,
            nonReciprocal: this.findNonReciprocal(userData.followers, userData.following)
        };
    } catch (error) {
        console.error('Error getting real user data:', error);
        throw error;
    }
};

EmbeddedInstagramAPI.prototype.findNonReciprocal = function(followers, following) {
    const followerUsernames = new Set(followers.map(u => u.username.toLowerCase()));
    return following.filter(
        user => !followerUsernames.has(user.username.toLowerCase())
    );
};
// Action Queue System
EmbeddedInstagramAPI.prototype.unfollowUser = async function(username) {
    const csrfToken = await this.getCSRFToken();
    const formData = new FormData();
    formData.append('user_id', username);
    
    try {
        const response = await fetch(`https://www.instagram.com/api/v1/friendships/remove_follower/${username}/`, {
            method: 'POST',
            headers: {
                'x-csrftoken': csrfToken,
                'x-ig-app-id': '936619743392459'
            },
            credentials: 'include',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Failed to unfollow ${username}:`, error);
        throw error;
    }
};
EmbeddedInstagramAPI.prototype.getMockFollowers = function(limit) {
    const mockUsers = [];
    const usernames = [
        'ghost_follower_1', 'inactive_user_23', 'bot_account_56', 'fake_profile_89',
        'spam_account_12', 'dead_follower_34', 'ghost_user_67', 'inactive_bot_90',
        'fake_engagement_45', 'zombie_follower_78', 'silent_ghost_01', 'bot_farm_23',
        'inactive_spam_56', 'ghost_profile_89', 'dead_account_12', 'real_user_1',
        'engaged_follower_2', 'active_user_3', 'loyal_fan_4', 'genuine_account_5'
    ];

    for (let i = 0; i < Math.min(limit, usernames.length); i++) {
        mockUsers.push({
            username: usernames[i],
            fullName: `User ${i + 1}`,
            profilePicture: `https://via.placeholder.com/150?text=${usernames[i]}`,
            isPrivate: Math.random() > 0.7,
            followerCount: Math.floor(Math.random() * 10000),
            followingCount: Math.floor(Math.random() * 1000),
            postCount: Math.floor(Math.random() * 500),
            isBot: usernames[i].includes('bot') || usernames[i].includes('fake'),
            isInactive: usernames[i].includes('inactive') || usernames[i].includes('ghost')
        });
    }

    return mockUsers;
};

EmbeddedInstagramAPI.prototype.getMockFollowing = function(limit) {
    const mockUsers = [];
    const usernames = [
        'celebrity_account', 'brand_official', 'friend_user_1', 'work_colleague',
        'family_member_1', 'hobby_account', 'news_outlet', 'influencer_123'
    ];

    for (let i = 0; i < Math.min(limit, usernames.length); i++) {
        mockUsers.push({
            username: usernames[i],
            fullName: `Following ${i + 1}`,
            profilePicture: `https://via.placeholder.com/150?text=${usernames[i]}`,
            isPrivate: Math.random() > 0.8,
            followerCount: Math.floor(Math.random() * 100000),
            followingCount: Math.floor(Math.random() * 2000),
            postCount: Math.floor(Math.random() * 1000)
        });
    }

    return mockUsers;
};

EmbeddedInstagramAPI.prototype.getMockPosts = function(limit) {
    const mockPosts = [];
    
    for (let i = 0; i < limit; i++) {
        const post = {
            id: `post_${i}`,
            shortcode: `ABC${i}DEF`,
            caption: `This is post number ${i + 1} #instagram #test`,
            timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
            likeCount: Math.floor(Math.random() * 1000),
            commentCount: Math.floor(Math.random() * 100),
            mediaType: Math.random() > 0.5 ? 'image' : 'video',
            thumbnailUrl: `https://via.placeholder.com/400?text=Post${i + 1}`,
            engagement: []
        };

        // Generate mock engagement data
        const engagementCount = Math.min(post.likeCount, 50); // Limit for performance
        const followers = this.getMockFollowers(100);
        
        for (let j = 0; j < engagementCount; j++) {
            const follower = followers[j % followers.length];
            post.engagement.push({
                username: follower.username,
                type: Math.random() > 0.8 ? 'comment' : 'like',
                timestamp: new Date(Date.now() - (j * 60 * 1000)).toISOString()
            });
        }

        mockPosts.push(post);
    }

    return mockPosts;
};

EmbeddedInstagramAPI.prototype.analyzeEngagement = function(posts, followers) {
    const analysis = {
        lowEngagement: [],
        noEngagement: [],
        highEngagement: [],
        totalAnalyzed: followers.length
    };

    followers.forEach(follower => {
        let totalEngagement = 0;
        let engagementCount = 0;

        posts.forEach(post => {
            const userEngagement = post.engagement.filter(eng => eng.username === follower.username);
            totalEngagement += userEngagement.length;
            if (userEngagement.length > 0) {
                engagementCount++;
            }
        });

        const engagementRate = posts.length > 0 ? (engagementCount / posts.length) * 100 : 0;

        follower.engagementRate = engagementRate;
        follower.totalEngagement = totalEngagement;

        if (engagementRate === 0) {
            analysis.noEngagement.push(follower);
        } else if (engagementRate < 10) {
            analysis.lowEngagement.push(follower);
        } else {
            analysis.highEngagement.push(follower);
        }
    });

    return analysis;
};