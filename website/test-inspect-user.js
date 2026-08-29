async function inspectUserData(username) {
  const res = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'x-ig-app-id': '936619743392459',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    }
  });

  console.log('Status:', res.status);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    const user = json?.data?.user;
    console.log('User found:', !!user);
    if (user) {
      console.log({
        username: user.username,
        fullName: user.full_name,
        followers: user.edge_followed_by?.count,
        following: user.edge_follow?.count,
        isVerified: user.is_verified,
        isPrivate: user.is_private,
        avatar: user.profile_pic_url_hd || user.profile_pic_url,
        postCount: user.edge_owner_to_timeline_media?.count,
      });

      const edges = user.edge_owner_to_timeline_media?.edges || [];
      if (edges.length > 0) {
        const likes = edges.map(e => e.node.edge_liked_by?.count || e.node.edge_media_preview_like?.count || 0);
        console.log('Likes across recent posts:', likes);
        const avg = Math.round(likes.reduce((a, b) => a + b, 0) / likes.length);
        console.log('Average likes calculated:', avg);
      }
    }
  } catch (err) {
    console.log('Response body:', text.slice(0, 200));
  }
}

inspectUserData('theleeparsons');
